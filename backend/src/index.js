import express from "express"
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { app, server} from "./lib/socket.js";
import path from "path";


dotenv.config(); //this will load the environment variables from the .env file and make them available in process.env
// const app = express(); //this will create an instance of express and assign it to the variable app. We can use this variable to define our routes and middleware.
//no more use of app and server here because we have already created them in socket.js and we will import them here. This is because we want to use the same server for both http and socket.io

const PORT = process.env.PORT
const __dirname = path.resolve();

app.use(express.json()); //this allows to extract the json data out of the body
app.use(cookieParser()); //this allows us to extract the cookies from the request and make it available in req.cookies
app.use(cors({ //this will allow the frontend to make requests to the backend without any issues. It will allow requests from http://localhost:5173 and will also allow credentials (cookies) to be sent along with the requests.
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth" , authRoutes); //this means that whenever we make a request to /api/auth, it will be handled by the authRoutes. So all the routes defined in authRoutes will be prefixed with /api/auth
app.use("/api/messages" , messageRoutes); 

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")));

    app.get((req,res) => {
        res.sendFile(path.join(__dirname,"../frontend", "dist" , "index.html"));
    })
}

server.listen(PORT,() => {
    console.log("server is running on port: " + PORT);
    connectDB(); 
});
