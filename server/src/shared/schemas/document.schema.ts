import { z } from 'zod';

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const MatrixTupleSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
]);

export const ShadowEffectSchema = z.object({
  color: z.string(),
  blur: z.number().min(0),
  offsetX: z.number(),
  offsetY: z.number(),
});

export const PathPointSchema = z.object({
  id: z.string(),
  point: PointSchema,
  handleIn: PointSchema.optional(),
  handleOut: PointSchema.optional(),
});

const BaseNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
  opacity: z.number().min(0).max(1),
  rotation: z.number(),
  transformMatrix: MatrixTupleSchema.optional(),
  parentId: z.string().nullable().optional(),
  style: z
    .object({
      fill: z.string().optional(),
      stroke: z.string().optional(),
      strokeWidth: z.number().min(0).optional(),
      cornerRadius: z.number().min(0).optional(),
    })
    .optional(),
});

export const RectangleNodeSchema = BaseNodeSchema.extend({
  type: z.literal('rectangle'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  cornerRadius: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const EllipseNodeSchema = BaseNodeSchema.extend({
  type: z.literal('ellipse'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const LineNodeSchema = BaseNodeSchema.extend({
  type: z.literal('line'),
  x1: z.number().optional(),
  y1: z.number().optional(),
  x2: z.number().optional(),
  y2: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const TextNodeSchema = BaseNodeSchema.extend({
  type: z.literal('text'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  fontSize: z.number().min(1),
  fontFamily: z.string(),
  fontWeight: z.union([z.number(), z.string()]).optional(),
  textAlign: z.enum(['left', 'center', 'right', 'justify']).optional(),
  fill: z.string().optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const FrameNodeSchema = BaseNodeSchema.extend({
  type: z.literal('frame'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  cornerRadius: z.number().min(0).optional(),
  clipContent: z.boolean().optional(),
  childIds: z.array(z.string()).optional(),
  childrenIds: z.array(z.string()).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const PathNodeSchema = BaseNodeSchema.extend({
  type: z.literal('path').or(z.literal('pen')),
  points: z.array(PathPointSchema).or(z.array(z.object({ x: z.number(), y: z.number() }))),
  closed: z.boolean().optional(),
  fill: z.string().optional(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const ImageNodeSchema = BaseNodeSchema.extend({
  type: z.literal('image'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  src: z.string(),
  cornerRadius: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
});

export const GroupNodeSchema = BaseNodeSchema.extend({
  type: z.literal('group'),
  childIds: z.array(z.string()).optional(),
  childrenIds: z.array(z.string()).optional(),
});

export const GenericNodeSchema = BaseNodeSchema.passthrough();

export const DesignNodeSchema = z.union([
  RectangleNodeSchema,
  EllipseNodeSchema,
  LineNodeSchema,
  TextNodeSchema,
  FrameNodeSchema,
  PathNodeSchema,
  ImageNodeSchema,
  GroupNodeSchema,
  GenericNodeSchema,
]);

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundColor: z.string().optional(),
  viewport: z
    .object({
      x: z.number(),
      y: z.number(),
      zoom: z.number(),
    })
    .optional(),
  rootNodeIds: z.array(z.string()).optional(),
  nodes: z.union([z.array(DesignNodeSchema), z.record(DesignNodeSchema)]),
});

export const DocumentModelSchema = z.object({
  schemaVersion: z.number().optional(),
  id: z.string(),
  name: z.string(),
  createdAt: z.union([z.number(), z.string()]),
  updatedAt: z.union([z.number(), z.string()]),
  version: z.number(),
  pages: z.array(PageSchema).min(1),
  activePageId: z.string(),
  thumbnail: z.string().optional(),
  thumbnailUrl: z.string().optional().nullable(),
});

export const documentSchema = DocumentModelSchema;
export type DocumentModelData = z.infer<typeof DocumentModelSchema>;
export type DocumentModel = DocumentModelData;
