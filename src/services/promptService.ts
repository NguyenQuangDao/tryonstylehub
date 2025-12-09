interface UserInfo {
  gender: 'male' | 'female' | 'non-binary';
  height: number;
  weight: number;
  skinTone: 'very-light' | 'light' | 'medium' | 'tan' | 'brown' | 'dark';
  eyeColor: 'brown' | 'black' | 'blue' | 'green' | 'gray' | 'amber';
  hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'white' | 'gray' | 'other';
  hairStyle: 'long' | 'short' | 'curly' | 'straight' | 'bald' | 'wavy';
}

export class PromptService {
  /**
   * Tạo prompt DALL-E từ thông tin người dùng
   */
  async generatePrompt(userInfo: UserInfo): Promise<string> {
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Xử lý lỗi rate limit cụ thể
        if (response.status === 429 || data.errorCode === 'RATE_LIMIT_EXCEEDED') {
          return this.generateFallbackPrompt(userInfo);
        }
        throw new Error(data.error || 'Không thể tạo prompt');
      }

      return data.prompt;
    } catch (error) {
      console.warn('Error calling prompt API:', error);
      // Fallback to manual prompt generation
      return this.generateFallbackPrompt(userInfo);
    }
  }

  /**
   * Kết hợp thông tin người dùng và mô tả để tạo/tối ưu prompt
   */
  async composeAndImprovePrompt(userInfo: UserInfo, description: string): Promise<string> {
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userInfo, prompt: description }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 429 || data.errorCode === 'RATE_LIMIT_EXCEEDED') {
          return this.generateFallbackPrompt(userInfo);
        }
        throw new Error(data.error || 'Không thể tạo prompt');
      }

      return data.prompt;
    } catch (error) {
      console.warn('Error calling prompt API (compose):', error);
      return this.generateFallbackPrompt(userInfo);
    }
  }

  /**
   * Xác định dáng người dựa trên chiều cao và cân nặng
   */
  private determineBodyType(height: number, weight: number): string {
    const bmi = weight / Math.pow(height / 100, 2);
    
    if (bmi < 18.5) return 'slim';
    if (bmi < 25) return 'athletic';
    if (bmi < 30) return 'average';
    return 'plus-size';
  }

  /**
   * Tạo prompt dự phòng khi API thất bại
   */
  private generateFallbackPrompt(userInfo: UserInfo): string {
    const genderTerm = userInfo.gender === 'male' ? 'man' : 
                     userInfo.gender === 'female' ? 'woman' : 'person';
    
    const skinToneMap = {
      'very-light': 'very fair',
      'light': 'light',
      'medium': 'medium',
      'tan': 'tan',
      'brown': 'brown',
      'dark': 'dark'
    };

    const hairColorMap = {
      'black': 'black',
      'brown': 'brown',
      'blonde': 'blonde',
      'red': 'red',
      'white': 'white',
      'gray': 'gray',
      'other': 'colorful'
    };

    const hairStyleMap = {
      'long': 'long',
      'short': 'short',
      'curly': 'curly',
      'straight': 'straight',
      'bald': 'bald',
      'wavy': 'wavy'
    };

    const bodyType = this.determineBodyType(userInfo.height, userInfo.weight);

    const hairStyleDesc = hairStyleMap[userInfo.hairStyle];

    const genderSilhouette = userInfo.gender === 'female' ? 'feminine body silhouette' : userInfo.gender === 'male' ? 'masculine body silhouette' : 'androgynous body silhouette';
    const genderNegatives = userInfo.gender === 'female' || userInfo.gender === 'non-binary' ? ', no beard, no mustache, no stubble' : '';
    return `Photorealistic full-body portrait of an adult ${genderTerm}, ${genderSilhouette}, ${bodyType}, ${hairStyleDesc} hair silhouette, neutral facial structure${genderNegatives}, natural standing pose, subject centered, head-to-toe visible, single subject only, one person, solo portrait, single frame, realistic human proportions, balanced exposure, denoised, artifact-free, plain neutral background`;
  }
}
