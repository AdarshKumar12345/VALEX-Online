import app from "./app.js";
import env from "./config/env.js";

const PORT = env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});

