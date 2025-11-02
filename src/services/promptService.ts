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
          throw new Error('API đang quá tải, đang sử dụng prompt tự động...');
        }
        throw new Error(data.error || 'Không thể tạo prompt');
      }

      return data.prompt;
    } catch (error) {
      console.error('Error calling prompt API:', error);
      // Fallback to manual prompt generation
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

    return `Professional full body portrait of a ${bodyType} ${genderTerm} with ${skinToneMap[userInfo.skinTone]} skin tone, ${hairColorMap[userInfo.hairColor]} ${hairStyleMap[userInfo.hairStyle]} hair, ${userInfo.eyeColor} eyes, standing straight in a natural pose, white studio background, professional lighting, high quality, realistic, fashion photography style, minimal clothing, friendly expression, 4K resolution`;
  }
}