import { GoogleGenAI } from '@google/genai';
import { logger } from '../../config/logger.js';
import {
  generateTemplateDesign,
  type DesignNodeData,
  type GeneratedDesignResult,
} from './ai.templates.js';

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
];

export class AiService {
  async generateDesign(
    prompt: string,
    targetPosition?: { x: number; y: number },
    customApiKey?: string
  ): Promise<GeneratedDesignResult> {
    const apiKey = (customApiKey || process.env.GEMINI_API_KEY || '').trim();
    const baseX =
      typeof targetPosition?.x === 'number' && Number.isFinite(targetPosition.x)
        ? Math.round(targetPosition.x)
        : 120;
    const baseY =
      typeof targetPosition?.y === 'number' && Number.isFinite(targetPosition.y)
        ? Math.round(targetPosition.y)
        : 120;

    const sanitizeResult = (res: GeneratedDesignResult): GeneratedDesignResult => {
      const sanitizedNodes = (res.nodes || []).map((n) => {
        const isText = n.type === 'text';
        const isFrame = n.type === 'frame';

        return {
          ...n,
          id: n.id || `node_${Math.random().toString(36).substring(2, 9)}`,
          type: n.type || 'rectangle',
          name: n.name || (isText ? 'Text' : isFrame ? 'Frame' : 'Shape'),
          visible: n.visible ?? true,
          locked: n.locked ?? false,
          opacity: typeof n.opacity === 'number' && Number.isFinite(n.opacity) ? n.opacity : 1,
          rotation: typeof n.rotation === 'number' && Number.isFinite(n.rotation) ? n.rotation : 0,
          x: typeof n.x === 'number' && Number.isFinite(n.x) ? Math.round(n.x) : baseX,
          y: typeof n.y === 'number' && Number.isFinite(n.y) ? Math.round(n.y) : baseY,
          width:
            typeof n.width === 'number' && Number.isFinite(n.width) && n.width > 0
              ? Math.round(n.width)
              : isText
              ? 180
              : 100,
          height:
            typeof n.height === 'number' && Number.isFinite(n.height) && n.height > 0
              ? Math.round(n.height)
              : isText
              ? 24
              : 100,
          fill: n.fill || (isText ? '#FFFFFF' : isFrame ? '#1E1E1E' : '#3B82F6'),
          stroke: n.stroke || undefined,
          strokeWidth: typeof n.strokeWidth === 'number' ? n.strokeWidth : undefined,
          cornerRadius:
            typeof n.cornerRadius === 'number' ? n.cornerRadius : isFrame ? 16 : undefined,
          clipContent: isFrame ? (n.clipContent ?? true) : undefined,
          childrenIds: isFrame && Array.isArray(n.childrenIds) ? n.childrenIds : undefined,
          parentId: n.parentId || undefined,
          text: isText ? (n.text || n.name || 'Text') : undefined,
          fontSize: isText ? (typeof n.fontSize === 'number' ? n.fontSize : 14) : undefined,
          fontFamily: isText ? (n.fontFamily || 'Inter, sans-serif') : undefined,
          fontWeight: isText ? (n.fontWeight || 'normal') : undefined,
          textAlign: isText ? (n.textAlign || 'left') : undefined,
        };
      });

      return {
        title: res.title || 'Generated UI Component',
        explanation: res.explanation || 'Component generated successfully.',
        suggestedPrompts: Array.isArray(res.suggestedPrompts) ? res.suggestedPrompts : [],
        nodes: sanitizedNodes,
      };
    };

    if (apiKey && apiKey.length > 5) {
      try {
        logger.info({ prompt, keyPrefix: apiKey.substring(0, 7) }, 'Calling Google Gemini API...');
        const result = await this.callGemini(apiKey, prompt, baseX, baseY);
        if (result && result.nodes && result.nodes.length > 0) {
          logger.info({ count: result.nodes.length, title: result.title }, 'Gemini successfully generated design');
          return sanitizeResult(result);
        }
      } catch (error) {
        logger.warn(
          { error: (error as Error).message },
          'Gemini API error, falling back to smart procedural template generator'
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
    const systemInstruction = `You are a world-class Senior UI/UX Designer and Vector Graphics Engine Specialist in VECTORLY (a modern vector design editor like Figma).
Your job is to read user design prompts and generate pixel-perfect, modern, production-grade vector UI components.

STRICT DESIGN RULES:
1. Every component MUST have a container FrameNode (type: 'frame') enclosing child elements (cards, buttons, inputs, icons, labels).
2. Layout coordinates MUST start at (baseX: ${baseX}, baseY: ${baseY}).
   All child nodes must have absolute canvas coordinates: (child.x = baseX + relativeX, child.y = baseY + relativeY).
3. Frame childrenIds MUST list the IDs of its child nodes, and each child node MUST have parentId set to the frame's id.
4. Supported Node Types:
   - 'frame': Container card or artboard with fill (e.g. '#1E1E1E', '#18181B', '#0F172A'), cornerRadius (12 to 24), stroke ('#27272A', '#383838'), childrenIds.
   - 'rectangle': Input fields, buttons, cards, image placeholders, tags, badges, dividers.
   - 'text': Headings, body copy, button labels, subtitles, metrics. (text, fontSize, fontWeight, textAlign, fill).
   - 'ellipse': Avatars, round icon buttons, badges, indicators, notification dots.
5. Visual Polish:
   - Dark mode modern UI palette:
     * Backgrounds: '#18181B', '#1E1E1E', '#0F172A', '#111827'
     * Cards/Inputs: '#27272A', '#2D2D30', '#1F2937'
     * Borders: '#3F3F46', '#383838', '#374151'
     * Accents: '#0D99FF' (Figma Blue), '#6366F1' (Indigo), '#10B981' (Emerald), '#F59E0B' (Amber), '#EC4899' (Pink)
     * Text: Primary '#FFFFFF', Secondary '#94A3B8', Muted '#64748B'
6. You MUST respond with ONLY valid JSON matching this exact structure (no markdown fences, no extra text):
{
  "title": "Clean concise title of the component",
  "explanation": "1-2 sentence description explaining what was designed",
  "suggestedPrompts": [
    "Relevant follow-up modification prompt 1",
    "Relevant follow-up modification prompt 2"
  ],
  "nodes": [
    {
      "id": "frame_main",
      "type": "frame",
      "name": "Main Container",
      "x": ${baseX},
      "y": ${baseY},
      "width": 380,
      "height": 520,
      "fill": "#18181B",
      "stroke": "#27272A",
      "strokeWidth": 1,
      "cornerRadius": 16,
      "childrenIds": ["child_1", "child_2"]
    },
    {
      "id": "child_1",
      "type": "text",
      "name": "Title",
      "x": ${baseX + 24},
      "y": ${baseY + 24},
      "width": 300,
      "height": 28,
      "text": "Card Heading",
      "fontSize": 20,
      "fontWeight": "bold",
      "fill": "#FFFFFF",
      "parentId": "frame_main"
    }
  ]
}`;

    // Attempt models in order: gemini-2.5-flash -> gemini-1.5-flash -> gemini-2.0-flash
    let rawText: string | null = null;
    let lastError: Error | null = null;

    // 1. First try with official @google/genai SDK
    try {
      const ai = new GoogleGenAI({ apiKey });
      for (const model of CANDIDATE_MODELS) {
        try {
          logger.info({ model }, 'Trying Gemini SDK generateContent...');
          const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          });
          const text = response.text?.trim();
          if (text) {
            rawText = text;
            break;
          }
        } catch (mErr) {
          lastError = mErr as Error;
          logger.warn({ model, err: (mErr as Error).message }, 'Gemini model attempt failed, trying next...');
        }
      }
    } catch (sdkErr) {
      lastError = sdkErr as Error;
      logger.warn({ err: (sdkErr as Error).message }, 'Gemini SDK init failed, falling back to direct REST API');
    }

    // 2. Direct REST fallback if SDK had issues
    if (!rawText) {
      for (const model of CANDIDATE_MODELS) {
        try {
          logger.info({ model }, 'Trying Gemini direct REST API...');
          const restUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(restUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] },
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
            }),
          });

          if (res.ok) {
            const data = (await res.json()) as any;
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (candidateText) {
              rawText = candidateText;
              break;
            }
          } else {
            const errBody = await res.text();
            logger.warn({ model, status: res.status, body: errBody.substring(0, 150) }, 'REST attempt failed');
          }
        } catch (restErr) {
          lastError = restErr as Error;
        }
      }
    }

    if (!rawText) {
      if (lastError) throw lastError;
      return null;
    }

    // Clean JSON (strip markdown code blocks if model wrapped it in ```json ... ```)
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    // Find JSON boundary if extra text was included
    const firstBrace = cleanJson.indexOf('{');
    const lastBrace = cleanJson.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
    }

    try {
      const parsed = JSON.parse(cleanJson) as GeneratedDesignResult;
      if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        // Remap IDs to ensure uniqueness on canvas
        const idMap = new Map<string, string>();
        parsed.nodes.forEach((n) => {
          const freshId = `${n.type || 'node'}_gemini_${Math.random().toString(36).substring(2, 9)}`;
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
      logger.warn({ err, cleanJson: cleanJson.substring(0, 200) }, 'Failed to parse Gemini JSON output');
    }

    return null;
  }
}

export const aiService = new AiService();

