import { composePromptFromAll } from '../src/lib/promptComposer'

const prompt = composePromptFromAll({
  gender: 'male',
  height: 180,
  weight: 75,
  skinTone: 'medium',
  eyeColor: 'brown',
  hairColor: 'black',
  hairStyle: 'short'
}, 'athletic build, neutral pose')

console.log(prompt)
