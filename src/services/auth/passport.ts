import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { normalizeCurrency } from "@/utils/manipulate/normalize";
import { TUser, User } from "../db/User";
import { ErrorResponseType } from "../respond/types";
import { Money } from "../db/Money";
import { AppError } from "../error/AppError";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findFirst({ where: { email: email.trim() } }, { error: null });
      if (!user || !user.password) {
        return done(null, false, { message: "Email not registered", code: "CLIENT_FIELD", field: "email" } as ErrorResponseType);
      }

      const passwordValid = await bcrypt.compare(password.trim(), user.password);
      if (!passwordValid) {
        return done(null, false, { message: "Incorrect Password", code: "CLIENT_FIELD", field: "password" } as ErrorResponseType);
      }

      done(null, user as TUser);
    } catch (err) {
      console.error(err);
      done(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findFirst(
          {
            where: {
              OR: [{ googleId: profile.id }, { email: profile.emails![0].value }],
            },
          },
          { error: null }
        );

        if (user?.googleId === profile.id) {
          return done(null, user as TUser);
        }

        if (user?.email === profile.emails![0].value) {
          const updatedUser = await User.updateById(user.id, {
            data: {
              googleId: profile.id,
              gmail: profile.emails![0].value,
            },
          });
          return done(null, updatedUser as TUser);
        }

        const createdUser = await User.create({
          data: {
            googleId: profile.id,
            gmail: profile.emails![0]?.value,
            fullName: profile.displayName,
          },
        });
        await Money.create({ data: { userId: createdUser.id } });

        done(null, createdUser as TUser);
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);

passport.use(
  "google-bind",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/api/auth/google-bind/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = req.user!;
        const updatedUser = await User.updateById(
          user.id.toString(),
          {
            data: {
              googleId: profile.id,
              gmail: profile.emails![0].value,
            },
          },
          { error: null }
        );
        if (!updatedUser) {
          return done(null, false, {
            title: "User not found",
            message: "User not found. Please back to dashboard or sign in page",
            code: "NOT_FOUND",
          } as ErrorResponseType);
        }
        return done(null, updatedUser as TUser);
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findById(userId as string, {}, { error: null });

    if (!user) {
      return done(new AppError("NOT_FOUND", { item: "User" }));
    }

    done(null, user as TUser);
  } catch (error) {
    done(error);
  }
});
