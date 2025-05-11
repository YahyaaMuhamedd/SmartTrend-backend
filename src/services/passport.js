
import { use, serializeUser, deserializeUser } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userModel } from '../../DataBase/models/user.model.js';

use(
   new GoogleStrategy(
      {
         clientID: process.env.GOOGLE_CLIENT_ID,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
         callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
         done(null, profile);



         // try {
         //    // شوف إذا كان المستخدم موجود في الداتا بيز أو لأ
         //    let user = await userModel.findOne({ googleId: profile.id });

         //    if (!user) {
         //       // لو المستخدم مش موجود، نعمله إنشاء جديد
         //       user = new userModel({
         //             googleId: profile.id,
         //             displayName: profile.displayName,
         //             email: profile.emails[0].value,
         //             picture: profile.photos[0].value,
         //       });
         //       await user.save(); // خزّن المستخدم في الداتا بيز
         //    }

         //    return done(null, user); // رجّع المستخدم بعد التوثيق
         // } catch (error) {
         //    console.error(error);
         //    done(error, null); // رجّع الخطأ لو حصل
         // }
      }
   )
);

serializeUser((user, done) => done(null, user));
deserializeUser((obj, done) => done(null, obj));




const jwt = require('jsonwebtoken');

passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'YOUR_CALLBACK_URL'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // استخرج البيانات من profile التي تأتي من جوجل
        const { id, displayName, emails, photos } = profile;
        let user = await User.findOne({ googleId: id });

        if (!user) {
            // هنا يمكنك إضافة معلومات أخرى حسب الحاجة
            user = new User({
                googleId: id,
                displayName,
                email: emails[0].value,
                picture: photos[0].value,
            });
            await user.save();
        }

        // إنشاء توكن جديد ببيانات مخصصة
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            displayName: user.displayName
        }, 'your_secret_key', { expiresIn: '1h' });

        // يمكنك الآن إرسال التوكن الجديد للمستخدم
        done(null, { token });
    } catch (error) {
        done(error, null);
    }
}));
