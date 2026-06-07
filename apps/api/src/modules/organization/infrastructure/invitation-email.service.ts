import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

/**
 * Best-effort transactional email for invitations. Uses the Resend HTTP API
 * when RESEND_API_KEY is configured; otherwise it is a no-op and the caller
 * falls back to sharing the invite link directly. No SDK dependency required.
 */
@Injectable()
export class InvitationEmailService {
  private readonly logger = new Logger(InvitationEmailService.name);
  private readonly apiKey?: string;
  private readonly from: string;

  constructor(config: ConfigService) {
    const key = config.get<string>("RESEND_API_KEY")?.trim();
    this.apiKey = key && key.startsWith("re_") && key.length > 10 ? key : undefined;
    this.from = config.get<string>("EMAIL_FROM") ?? "noreply@example.com";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async sendInvite(params: {
    to: string;
    organizationName: string;
    inviteUrl: string;
  }): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: params.to,
          subject: `You've been invited to ${params.organizationName}`,
          html: `<p>You've been invited to join <strong>${params.organizationName}</strong>.</p>
                 <p><a href="${params.inviteUrl}">Accept your invitation</a></p>`,
        }),
      });
      if (!res.ok) {
        this.logger.warn(`Resend responded with ${res.status}`);
        return false;
      }
      return true;
    } catch (err) {
      this.logger.warn(`Failed to send invitation email: ${String(err)}`);
      return false;
    }
  }
}
