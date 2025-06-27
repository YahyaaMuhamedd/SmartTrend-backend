
import helmet from "helmet";
import hpp from "hpp";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import cors from "cors";

export const applySecurityMiddlewares = (app) => {

   //^1️⃣ Secure HTTP headers
   // app.use(helmet()) ;
   app.use(
      helmet.contentSecurityPolicy({
         directives: {
            defaultSrc: ["'self'"],
            imgSrc: [
               "'self'",
               'data:',
               'blob:',
               'https://res.cloudinary.com'
            ], // Allow Appear From this source
         },
      })
   );






   //^2️⃣ Enable CORS (Cross-Origin Resource Sharing)
   app.use(cors());
   // app.use(
   //    cors({
   //       origin: "*", // أو حدد الدومين بتاعك بدل * لو عايز تحكم أكتر
   //       methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
   //       allowedHeaders: ["Content-Type", "Authorization"],
   //    })
   // );






   //^3️⃣ Rate limiting - Control in request count more than 100 request server in blocked 15 minutes:
   const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minute
      max: 100,
      standardHeaders: true, // Enable New headers As : Retry-After
      legacyHeaders: false,  // Disable Old HeadersAs : X-RateLimit-*

      handler: (req, res, next) => {
         const retryAfterSeconds = Math.ceil((req.rateLimit.resetTime - new Date()) / 1000);
         const minutes = Math.floor(retryAfterSeconds / 60);
         const seconds = retryAfterSeconds % 60;


         res.status(429).json({
            success: false,
            message: `Too many requests from this IP :[ ${req.ip}], please try again after 15 minutes`,
            ip: req.ip,
            retryAfter: {
               totalSeconds: retryAfterSeconds,
               minutes,
               seconds,
            },
            resetTime: req.rateLimit.resetTime, // Retry Time 
            limit: req.rateLimit.limit, // Time Maximum
            current: req.rateLimit.current // Number of Current Orders
         });
      }
   });


   // const limiter = rateLimit({
   //    windowMs: 15 * 60 * 1000,
   //    max: 100,
   //    message: "Too many requests from this IP, please try again after 15 minutes"
   // });
   app.use('/api', limiter);


   //^4️⃣ Prevent NoSQL injection
   app.use(mongoSanitize());


   //^5️⃣ Prevent XSS (Cross-site scripting)
   app.use(xss());


   //^6️⃣ Prevent HTTP Parameter Pollution
   app.use(hpp());

   //^7️⃣ Disable X-Powered-By header (عشان ميبقاش واضح إنك شغال Express)
   app.disable("x-powered-by");
};
