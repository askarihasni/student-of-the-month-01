import { GoogleGenAI } from '@google/genai';
import { logger } from '../../config/logger.js';
import {
  generateTemplateDesign,
  type DesignNodeData,
  type GeneratedDesignResult,
} from './ai.templates.js';

export class AiService {
  async generateDesign(
    prompt: string,
    targetPosition?: { x: number; y: number },
    customApiKey?: string
  ): Promise<GeneratedDesignResult> {
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    const baseX = typeof targetPosition?.x === 'number' && Number.isFinite(targetPosition.x) ? targetPosition.x : 120;
    const baseY = typeof targetPosition?.y === 'number' && Number.isFinite(targetPosition.y) ? targetPosition.y : 120;

    const sanitizeResult = (res: GeneratedDesignResult): GeneratedDesignResult => {
      const sanitizedNodes = (res.nodes || []).map((n) => ({
        ...n,
        visible: n.visible ?? true,
        locked: n.locked ?? false,
        opacity: typeof n.opacity === 'number' && Number.isFinite(n.opacity) ? n.opacity : 1,
        rotation: typeof n.rotation === 'number' && Number.isFinite(n.rotation) ? n.rotation : 0,
        x: typeof n.x === 'number' && Number.isFinite(n.x) ? n.x : baseX,
        y: typeof n.y === 'number' && Number.isFinite(n.y) ? n.y : baseY,
        width: typeof n.width === 'number' && Number.isFinite(n.width) && n.width > 0 ? n.width : 100,
        height: typeof n.height === 'number' && Number.isFinite(n.height) && n.height > 0 ? n.height : 100,
      }));
      return {
        ...res,
        nodes: sanitizedNodes,
      };
    };

    if (apiKey && apiKey.trim().length > 5) {
      try {
        logger.info({ prompt }, 'Calling Google Gemini API to synthesize design nodes...');
        const result = await this.callGemini(apiKey.trim(), prompt, baseX, baseY);
        if (result && result.nodes && result.nodes.length > 0) {
          logger.info({ count: result.nodes.length }, 'Gemini successfully generated design nodes');
          return sanitizeResult(result);
        }
      } catch (error) {
        logger.warn(
          { error: (error as Error).message },
          'Gemini API call failed or encountered error, falling back to smart procedural template generator'
        );
      }
    }

    // High quality procedural generator fallback
    logger.info({ prompt }, 'Using high-fidelity procedural design generator');
    return sanitizeResult(generateTemplateDesign(prompt, baseX, baseY));
  }

  private async callGemini(
    apiKey: string,
    userPrompt: string,
    baseX: number,
    baseY: number
  ): Promise<GeneratedDesignResult | null> {
    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are a world-class Senior UI/UX Designer and Vector Graphics Engine Specialist in VECTORLY (a professional vector design editor like Figma).
Your job is to read user design prompts and generate pixel-perfect, modern, production-grade vector UI components.

Follow these strict rules:
1. Every component MUST have a container FrameNode (type: 'frame') enclosing child elements, or styled cards.
2. Coordinates MUST be based on the offset (baseX: ${baseX}, baseY: ${baseY}).
3. Supported types:
   - 'frame': Container with fill (e.g. '#1E1E1E'), cornerRadius (16-24), childrenIds array.
   - 'rectangle': Input fields, buttons, cards, image placeholders, tags, badges.
   - 'text': Headings, labels, buttons, subtitles, metrics. (text, fontSize, fontWeight, textAlign, fill).
   - 'ellipse': Circular avatars, icons, badges, indicators.
4. Colors should use modern dark UI palettes (e.g. Dark Slate '#1E1E1E', Border '#383838', Figma Blue '#0D99FF', Emerald '#10B981', Amber '#F59E0B', White '#FFFFFF', Slate text '#94A3B8').
5. You MUST return pure JSON matching this exact structure:
{
  "title": "Clean short title of the generated component",
  "explanation": "Friendly 1-2 sentence description explaining what was created",
  "suggestedPrompts": ["Next follow-up prompt 1", "Next follow-up prompt 2"],
  "nodes": [
    {
      "id": "frame_unique_id",
      "type": "frame",
      "name": "Component Name",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "fill": "#1E1E1E",
      "stroke": "#383838",
      "strokeWidth": 1,
      "cornerRadius": 16,
      "childrenIds": ["child_1", "child_2"]
    },
    ...
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) return null;

    try {
      const parsed = JSON.parse(text) as GeneratedDesignResult;
      if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        // Normalize IDs to prevent any collisions
        const idMap = new Map<string, string>();
        parsed.nodes.forEach((n) => {
          const freshId = `${n.type}_ai_${Math.random().toString(36).substring(2, 9)}`;
          idMap.set(n.id, freshId);
          n.id = freshId;
        });

        // Remap parentId and childrenIds
        parsed.nodes.forEach((n) => {
          if (n.parentId && idMap.has(n.parentId)) {
            n.parentId = idMap.get(n.parentId)!;
          }
          if (Array.isArray(n.childrenIds)) {
            n.childrenIds = n.childrenIds.map((cid) => idMap.get(cid) || cid);
          }
        });

        return parsed;
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to parse Gemini JSON output');
    }

    return null;
  }
}

export const aiService = new AiService();

