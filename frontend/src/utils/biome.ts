import type { Genre, BiomeType } from '../types';

export const getBiomeAt = (x: number, z: number): BiomeType => {
  if (x >= 0 && z >= 0) {
    return 'winter';
  } else if (x < 0 && z >= 0) {
    return 'desert';
  } else if (x < 0 && z < 0) {
    return 'spring';
  } else {
    return 'autumn';
  }
};

export const getTreeLabel = (genre: Genre, currentBiome: BiomeType): string => {
  const labels: Record<BiomeType, Record<Genre, string>> = {
    spring: {
      novel: '벚꽃나무 🌸',
      science: '소나무 🌲',
      humanities: '참나무 🌳',
      business: '단풍나무 🍁',
      other: '자작나무 🪵'
    },
    autumn: {
      novel: '가을 벚나무 🌸',
      science: '적송 🌲',
      humanities: '갈색 참나무 🌳',
      business: '붉은 단풍나무 🍁',
      other: '은행나무 🍂'
    },
    winter: {
      novel: '설화 나무 ❄️',
      science: '전나무 🌲',
      humanities: '참나무 🌳',
      business: '겨울 메이플 🍁',
      other: '은자작나무 🪵'
    },
    desert: {
      novel: '사막 장미 🌹',
      science: '야자수 🌴',
      humanities: '바오밥 나무 🌳',
      business: '사막 메이플 🍁',
      other: '마른 가시나무 🪵'
    }
  };
  return labels[currentBiome]?.[genre] || labels.spring[genre];
};
