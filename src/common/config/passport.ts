import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import config from "./config";
import User from "../../api/user/user.model";
import { tokenTypes } from "./tokens";

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload: any, done: any) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      return done(null, false);
    }
    const user = await User.findById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  }
  catch (error) {
    done(error, false);
  }
}

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

export default jwtStrategy;
