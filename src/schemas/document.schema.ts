import { z } from 'zod'

export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
})

export const MatrixTupleSchema = z.tuple([
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
  z.number(),
])

export const ShadowEffectSchema = z.object({
  color: z.string(),
  blur: z.number().min(0),
  offsetX: z.number(),
  offsetY: z.number(),
})

export const PathPointSchema = z.object({
  id: z.string(),
  point: PointSchema,
  handleIn: PointSchema.optional(),
  handleOut: PointSchema.optional(),
})

const BaseNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  visible: z.boolean(),
  locked: z.boolean(),
  opacity: z.number().min(0).max(1),
  rotation: z.number(),
  transformMatrix: MatrixTupleSchema,
  parentId: z.string().nullable().optional(),
})

export const RectangleNodeSchema = BaseNodeSchema.extend({
  type: z.literal('rectangle'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  cornerRadius: z.number().min(0),
  shadow: ShadowEffectSchema.optional(),
})

export const EllipseNodeSchema = BaseNodeSchema.extend({
  type: z.literal('ellipse'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  shadow: ShadowEffectSchema.optional(),
})

export const LineNodeSchema = BaseNodeSchema.extend({
  type: z.literal('line'),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  shadow: ShadowEffectSchema.optional(),
})

export const TextNodeSchema = BaseNodeSchema.extend({
  type: z.literal('text'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  text: z.string(),
  fontSize: z.number().positive(),
  fontFamily: z.string(),
  fontWeight: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
  fill: z.string(),
  shadow: ShadowEffectSchema.optional(),
})

export const FrameNodeSchema = BaseNodeSchema.extend({
  type: z.literal('frame'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  fill: z.string(),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).optional(),
  cornerRadius: z.number().min(0).optional(),
  clipContent: z.boolean(),
  childrenIds: z.array(z.string()),
})

export const PathNodeSchema = BaseNodeSchema.extend({
  type: z.literal('path'),
  points: z.array(PathPointSchema),
  closed: z.boolean(),
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().min(0),
  shadow: ShadowEffectSchema.optional(),
})

export const ImageNodeSchema = BaseNodeSchema.extend({
  type: z.literal('image'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  src: z.string(),
  cornerRadius: z.number().min(0).optional(),
  shadow: ShadowEffectSchema.optional(),
})

export const GroupNodeSchema = BaseNodeSchema.extend({
  type: z.literal('group'),
  childrenIds: z.array(z.string()),
})

export const DesignNodeSchema = z.discriminatedUnion('type', [
  RectangleNodeSchema,
  EllipseNodeSchema,
  LineNodeSchema,
  TextNodeSchema,
  FrameNodeSchema,
  PathNodeSchema,
  ImageNodeSchema,
  GroupNodeSchema,
])

export const PageSchema = z.object({
  id: z.string(),
  name: z.string(),
  backgroundColor: z.string(),
  nodes: z.array(DesignNodeSchema),
})

export const DocumentModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number(),
  pages: z.array(PageSchema).min(1),
  activePageId: z.string(),
  thumbnail: z.string().optional(),
})
