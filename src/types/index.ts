export interface GenerateCopyRequest {
  productImage: string; // base64
  shopName: string;
}

export interface CopySection {
  title: string;
  content: string;
  prompt: string;
}

export interface GenerateCopyResponse {
  sections: CopySection[];
}

export interface GenerateImageRequest {
  productImage: string; // base64
  copyPrompt: string;
  sectionIndex: number;
}

export interface GenerateImageResponse {
  imageBase64: string;
  mimeType: string;
}

export interface GenerationResult {
  sectionTitle: string;
  copyContent: string;
  imageBase64: string;
  mimeType: string;
}
