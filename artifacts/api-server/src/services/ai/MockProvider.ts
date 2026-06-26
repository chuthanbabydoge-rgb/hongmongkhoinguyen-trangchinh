import type { IAiProvider, ChatMessage, AiOptions, AiResponse } from "./IAiProvider.js";

const GREET_PATTERNS = [/xin chào|hello|hi|chào|hey/i, /bạn là ai|you are|who are you/i];
const WALLET_PATTERNS = [/wallet|credit|token|xu|tiền|balance|số dư/i];
const INVENTORY_PATTERNS = [/inventory|kho|vật phẩm|item|tài sản/i];
const QUEST_PATTERNS = [/quest|nhiệm vụ|mission/i];
const GUILD_PATTERNS = [/guild|bang hội/i];
const WORLD_PATTERNS = [/world|thế giới/i];
const MARKET_PATTERNS = [/marketplace|chợ|mua|bán|market/i];
const SOCIAL_PATTERNS = [/friend|bạn bè|social|follower/i];
const HELP_PATTERNS = [/help|giúp|hướng dẫn|how|cách|làm gì/i];
const SUGGEST_PATTERNS = [/gợi ý|suggest|recommend|nên làm/i];

function extractContext(systemPrompt?: string): Record<string, unknown> {
  if (!systemPrompt) return {};
  try {
    const match = systemPrompt.match(/\[CONTEXT_JSON\](.*?)\[\/CONTEXT_JSON\]/s);
    if (match) return JSON.parse(match[1]);
  } catch {}
  return {};
}

function buildResponse(userMsg: string, ctx: Record<string, unknown>): string {
  const wallet   = ctx["wallet"]   as Record<string, unknown> | undefined;
  const quests   = ctx["quests"]   as unknown[] | undefined;
  const guild    = ctx["guild"]    as Record<string, unknown> | undefined;
  const world    = ctx["world"]    as Record<string, unknown> | undefined;
  const mail     = ctx["mail"]     as Record<string, unknown> | undefined;
  const inventory = ctx["inventory"] as Record<string, unknown> | undefined;
  const social   = ctx["social"]   as Record<string, unknown> | undefined;

  if (GREET_PATTERNS.some(p => p.test(userMsg))) {
    return "Xin chào! Tôi là **Nova** — trợ lý AI của Universe Hub 🤖✨\n\nTôi có thể giúp bạn:\n- Theo dõi **Wallet** và tài sản\n- Gợi ý **Quest** phù hợp\n- Tư vấn **Marketplace**\n- Quản lý **Guild** và bạn bè\n- Khám phá **Worlds**\n\nHôm nay bạn cần tôi giúp gì?";
  }

  if (WALLET_PATTERNS.some(p => p.test(userMsg))) {
    if (wallet) {
      const credits = (wallet["credits"] as number) ?? 0;
      const xu      = (wallet["xu"]      as number) ?? 0;
      const token   = (wallet["token"]   as number) ?? 0;
      const tip = credits < 100 ? "\n\n⚠️ Credits của bạn khá thấp. Hãy tham gia Marketplace hoặc hoàn thành Quest để kiếm thêm!" : "\n\n💡 Bạn có thể đầu tư vào Marketplace để sinh lời thêm.";
      return `💰 **Wallet của bạn:**\n- **Credits:** ${credits.toLocaleString()}\n- **XU:** ${xu.toLocaleString()}\n- **Token:** ${token.toLocaleString()}${tip}`;
    }
    return "Tôi chưa có thông tin wallet của bạn. Hãy kết nối tài khoản để tôi hỗ trợ tốt hơn!";
  }

  if (INVENTORY_PATTERNS.some(p => p.test(userMsg))) {
    if (inventory) {
      const count = (inventory["itemCount"] as number) ?? 0;
      const rare  = (inventory["rareItems"] as number) ?? 0;
      return `🎒 **Inventory của bạn:**\n- Tổng cộng **${count} vật phẩm**\n- Trong đó **${rare} vật phẩm hiếm**\n\n💡 Kiểm tra Marketplace để bán các vật phẩm dư thừa và kiếm Credits!`;
    }
    return "Inventory của bạn hiện đang trống hoặc chưa được tải.";
  }

  if (QUEST_PATTERNS.some(p => p.test(userMsg))) {
    if (quests && quests.length > 0) {
      return `⚔️ **Quest của bạn:**\nBạn có **${quests.length} quest** đang tiến hành.\n\n💡 Gợi ý: Hoàn thành quest trước để nhận phần thưởng và tăng Reputation!`;
    }
    return "⚔️ Bạn chưa có quest nào đang tiến hành. Hãy ghé trang **Quests** để nhận nhiệm vụ mới và kiếm phần thưởng!";
  }

  if (GUILD_PATTERNS.some(p => p.test(userMsg))) {
    if (guild) {
      return `🏰 **Guild của bạn:** ${guild["name"] ?? "Không tên"}\n- Level: ${guild["level"] ?? 1}\n\n💡 Tham gia Guild Events để tăng Reputation và nhận phần thưởng tập thể!`;
    }
    return "🏰 Bạn chưa gia nhập guild nào. Hãy tìm kiếm guild phù hợp ở trang **Guild** để cùng nhau phát triển!";
  }

  if (WORLD_PATTERNS.some(p => p.test(userMsg))) {
    if (world) {
      return `🌍 **World hiện tại:** ${(world["currentWorld"] as Record<string, unknown>)?.["name"] ?? "Không có"}\n- Tổng online: ${world["totalOnline"] ?? 0} người\n\n💡 Khám phá các World mới để gặp gỡ người chơi và tham gia sự kiện!`;
    }
    return "🌍 Bạn chưa ở trong world nào. Hãy ghé trang **Universe Worlds** để khám phá!";
  }

  if (MARKET_PATTERNS.some(p => p.test(userMsg))) {
    return "🛒 **Marketplace** là nơi mua bán vật phẩm tốt nhất!\n\n💡 Gợi ý:\n1. List các vật phẩm không dùng tới\n2. Theo dõi watchlist để mua đúng giá\n3. Tham gia Auction để có hàng hiếm";
  }

  if (SOCIAL_PATTERNS.some(p => p.test(userMsg))) {
    if (social) {
      return `👥 **Mạng xã hội của bạn:**\n- Bạn bè: ${(social["friendCount"] as number) ?? 0}\n- Followers: ${(social["followerCount"] as number) ?? 0}\n\n💡 Kết bạn thêm để chia sẻ quest và cùng khám phá World!`;
    }
    return "👥 Hãy ghé trang **Social** để kết bạn và mở rộng mạng lưới của bạn!";
  }

  if (SUGGEST_PATTERNS.some(p => p.test(userMsg))) {
    const tips: string[] = [];
    if (wallet && (wallet["credits"] as number) > 500) tips.push("💰 Đầu tư Credits vào Marketplace để sinh lời");
    if (!quests || (quests as unknown[]).length === 0) tips.push("⚔️ Nhận Quest mới để tăng XP và phần thưởng");
    if (!guild) tips.push("🏰 Gia nhập Guild để nhận buff team");
    if (mail && (mail["unreadCount"] as number) > 0) tips.push(`📬 Đọc ${mail["unreadCount"]} mail chưa đọc — có thể có phần thưởng!`);
    tips.push("🌍 Ghé thăm World mới để gặp gỡ người chơi");
    return `✨ **Gợi ý của Nova hôm nay:**\n${tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;
  }

  if (HELP_PATTERNS.some(p => p.test(userMsg))) {
    return "🤖 Tôi có thể giúp bạn với:\n\n1. **Wallet** — kiểm tra số dư, giao dịch\n2. **Inventory** — quản lý vật phẩm\n3. **Quest** — theo dõi nhiệm vụ\n4. **Marketplace** — mua bán tư vấn\n5. **Guild** — quản lý bang hội\n6. **Worlds** — khám phá thế giới\n7. **Social** — kết bạn, mạng lưới\n\nHỏi tôi bất cứ điều gì bạn cần!";
  }

  const defaultResponses = [
    "Tôi hiểu bạn đang nói về điều đó. Hãy nói thêm để tôi có thể giúp tốt hơn! 🤖",
    "Thú vị đấy! Bạn có muốn tôi phân tích dữ liệu Hub của bạn về vấn đề này không?",
    "Hmm, để tôi suy nghĩ... Bạn có thể cung cấp thêm thông tin không? Tôi có thể xem Wallet, Inventory, Quest của bạn để đưa ra lời khuyên tốt nhất!",
    "Tôi đang học hỏi thêm! Trong khi đó, hãy thử hỏi tôi về Wallet, Quest, hoặc Marketplace để tôi hỗ trợ hiệu quả nhất 🌟",
  ];
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

export class MockProvider implements IAiProvider {
  readonly name  = "mock";
  readonly model = "nova-mock-1.0";

  async chat(messages: ChatMessage[], systemPrompt?: string, _options?: AiOptions): Promise<AiResponse> {
    const start    = Date.now();
    const userMsg  = messages.filter(m => m.role === "user").pop()?.content ?? "";
    const ctx      = extractContext(systemPrompt);
    const content  = buildResponse(userMsg, ctx);
    const tokens   = Math.ceil(content.length / 4);
    await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
    return {
      content,
      model:            this.model,
      provider:         this.name,
      promptTokens:     Math.ceil(userMsg.length / 4),
      completionTokens: tokens,
      totalTokens:      Math.ceil(userMsg.length / 4) + tokens,
      latencyMs:        Date.now() - start,
    };
  }
}
