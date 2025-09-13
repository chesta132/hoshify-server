import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { ErrorResponseType } from "@/class/Response";
import { User } from "@/models/User";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.trim() }).normalize();
      if (!user || !user.password) {
        return done(null, false, { message: "Email not registered", code: "CLIENT_FIELD", field: "email" } as ErrorResponseType);
      }

      const passwordValid = await bcrypt.compare(password.trim(), user.password);
      if (!passwordValid) {
        return done(null, false, { message: "Incorrect Password", code: "CLIENT_FIELD", field: "password" } as ErrorResponseType);
      }

      done(null, user);
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
        const user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails![0].value }],
        }).normalize();

        if (user?.googleId === profile.id) {
          return done(null, user);
        }

        if (user?.email === profile.emails![0].value) {
          const updatedUser = await User.findByIdAndUpdate(user.id, {
            googleId: profile.id,
            gmail: profile.emails![0].value,
          }).normalize();
          return done(null, updatedUser!);
        }

        const newUser = await User.create({
          googleId: profile.id,
          gmail: profile.emails![0]?.value,
          fullName: profile.displayName,
        });

        done(null, newUser.normalize());
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
        const updatedUser = await User.findByIdAndUpdate(user.id, {
          googleId: profile.id,
          gmail: profile.emails![0].value,
        }).normalize();
        if (!updatedUser) {
          return done(null, false, {
            title: "User not found",
            message: "User not found. Please back to dashboard or sign in page",
            code: "NOT_FOUND",
          } as ErrorResponseType);
        }
        return done(null, updatedUser);
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
    const user = await User.findOne({ id: userId as string }).normalize();

    if (!user) {
      return done(new Error("User not found"));
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});
