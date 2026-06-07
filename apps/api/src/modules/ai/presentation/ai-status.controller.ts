import { Controller, Get } from "@nestjs/common";
import { OpenAIService } from "../infrastructure/services/openai.service";

@Controller("ai")
export class AiStatusController {
  constructor(private readonly openai: OpenAIService) {}

  @Get("status")
  status() {
    return { configured: this.openai.isConfigured() };
  }
}
