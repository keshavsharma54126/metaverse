import { z } from "zod";
export const SignupSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  role: z.enum(["user", "admin"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
});

export const UpdateMetadataSchema = z.object({
  avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
  name: z.string(),
  //dimensions in format of "1000x1000"
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
  mapId: z.string(),
});

export const AddElementSchema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const DeleteElementSchema = z.object({
  spaceElementId: z.string(),
});

export const CreateElementSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const UpdateElementSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  static: z.boolean(),
});

export const CreateAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const CreateMapSchema = z.object({
 
  thumbnail: z.string(),
  dimensions: z.string(),
  name:z.string(),

});

export const UpdateMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string(),
  name: z.string(),
});
