exports.logError = (context, error, extra = {}) => {
  console.error(`\n❌ [${context}] Error occurred:`);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);

  if (error.code) console.error("DB Code:", error.code);
  if (Object.keys(extra).length > 0) {
    console.error("Extra Info:", JSON.stringify(extra, null, 2));
  }
};
