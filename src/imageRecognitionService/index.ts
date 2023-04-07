import "@/shared/utils/fixErrors.js";
import "@/shared/utils/mongooseToJson.js";
import * as dotenv from "dotenv";
import { Environment } from "@/shared/operation/Environment.js";
import { setupDependencies } from "@/imageRecognitionService/setup.js";

dotenv.config();
Environment.setup();
await setupDependencies();
// AuthServiceAlpha.setup();

// const port = Number(Environment.getInstance().targetServiceUrl.port) || 3004;

// const app = express();

// app.set("env", process.env.NODE_ENV);

// app.use(cors())
// app.use(express.json());

// setupGatewayAuthenticationMiddlewares(app, AuthServiceAlpha.getInstance());

// TODO: Routing in imageRecognitionService?
// app.use(authenticatedRouter);

// attachErrorHandlers(app);

console.log(`ImageRecognitionService is running.`);

// app.listen(port, () => {
// 	console.log('Server is up on port ' + port);
// });
