
const cors = require("cors");
const serverConfig = require("./server-config");

const corsconfig = () => cors({
  origin: serverConfig.FrontendOrigin,
  credentials: true,
});

module.exports = corsconfig;
