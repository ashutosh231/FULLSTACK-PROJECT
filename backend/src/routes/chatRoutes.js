const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/send", authMiddleware, chatController.sendMessage);

router.get(
  "/messages/:conversationId",
  authMiddleware,
  chatController.getMessages
);

module.exports = router;