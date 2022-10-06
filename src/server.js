import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";
import { crossOrigin, localMiddleware } from "./middleware";
import apiRouter from "./routers/apiRouter";


const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views"); //process.cwd()는 노드의 작업 경로
app.use(logger); // 모든 route에 적용된다.
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(
    session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.DB_URL
        }),
    })
);
// app.use(crossOrigin);
app.use(flash());
app.use(localMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/images", express.static("images"));
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

// express는 코드를 위에서부터 아래로 작동시킨다.

// get이랑 Listen이랑 형식이 매우 비슷하다. 첫번째 인자에 입력이 있고, 두번째 인자에 함수가 있음.

export default app;
