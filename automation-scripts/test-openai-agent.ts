import { runWorkflow } from "../agents";
import dotenv from "dotenv";
import path from "path";

// Load env from jab-cloud-gateway
dotenv.config({ path: path.join(__dirname, "../jab-cloud-gateway/.env.local") });

async function testAgent() {
  const prompt = "what does it include? I want to know the features.";
  
  console.log("Testing JAB Sales Agent Workflow...");
  console.log("Prompt:", prompt);
  
  try {
    const result = await runWorkflow({ input_as_text: prompt });
    console.log("--- AGENT RESPONSE ---");
    console.log(result.output_text);
    console.log("----------------------");
  } catch (error) {
    console.error("Error testing agent:", error);
  }
}

testAgent();