/**
 * Pattern Generator Library
 * 
 * Core pattern generation logic for CrochetAI
 * Uses mathematical formulas for verified patterns
 * 
 * @author CR AudioViz AI
 * @version 2.0.0
 */

// ============================================================
// TYPES
// ============================================================

export type DifficultyLevel = 'beginner' | 'easy' | 'intermediate' | 'advanced';
export type ShapeType = 'sphere' | 'flat_circle' | 'cylinder' | 'amigurumi_body' | 'rectangle';
export type StitchType = 'sc' | 'hdc' | 'dc' | 'tr';

export interface PatternRequest {
  prompt: string;
  difficulty: DifficultyLevel;
  projectType: string;
}

export interface Material {
  type: 'yarn' | 'hook' | 'notions';
  name: string;
  quantity: string;
  notes?: string;
}

export interface GeneratedSection {
  name: string;
  quantity: number;
  colorNote?: string;
  rounds: string[];
  stitchCount: number;
  tips: string[];
}

export interface FullPattern {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string;
  finishedSize: string;
  materials: Material[];
  gauge: string;
  abbreviations: { abbr: string; full: string }[];
  sections: GeneratedSection[];
  assembly: string[];
  designerNotes: string[];
  estimatedTime: string;
  content: string;
}

export interface GeneratedPatternResult {
  success: boolean;
  pattern?: FullPattern;
  error?: string;
}

// ============================================================
// STITCH PROPERTIES
// ============================================================

const STITCH_PROPERTIES = {
  sc: { baseCount: 6, heightRatio: 1.0 },
  hdc: { baseCount: 8, heightRatio: 1.5 },
  dc: { baseCount: 12, heightRatio: 2.0 },
  tr: { baseCount: 16, heightRatio: 2.5 },
};

// ============================================================
// ANIMAL TEMPLATES
// ============================================================

export const ANIMAL_TEMPLATES: Record<string, any> = {
  manatee: {
    difficulty: 'intermediate',
    category: 'Amigurumi',
    sections: [
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 5, height: 10 }, color: 'Gray (MC)' },
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 5 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Sew to front of body, no neck' },
      { name: 'Snout', shape: 'cylinder', quantity: 1, dimensions: { diameter: 3, height: 2 }, color: 'MC', attachTo: 'Head', attachmentNotes: 'Flatten slightly for manatee face' },
      { name: 'Front Flipper', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 3 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Fold in half, attach to sides' },
      { name: 'Tail', shape: 'flat_circle', quantity: 1, dimensions: { diameter: 5 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Pinch middle for paddle shape' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn - Gray', quantity: '100g / ~200 yards', notes: 'Main color' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 9mm', quantity: '2', notes: 'Black' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
      { type: 'notions', name: 'Yarn needle', quantity: '1' },
    ],
    colors: ['Gray'],
    specialNotes: [
      'Manatees have a rounded, paddle-shaped tail - pinch the flat circle in the middle',
      'The snout should be slightly flattened, not perfectly round',
      'Embroider small nostrils with black thread',
    ],
  },
  
  whale: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 6, height: 12 }, color: 'Blue (MC)' },
      { name: 'Belly Patch', shape: 'flat_circle', quantity: 1, dimensions: { diameter: 4 }, color: 'White (CC)', attachTo: 'Body', attachmentNotes: 'Sew to underside' },
      { name: 'Fin', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 3 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Fold in half for side fins' },
      { name: 'Tail Fluke', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 4 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Attach side by side at back' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn - Blue', quantity: '80g', notes: 'Main color' },
      { type: 'yarn', name: 'Worsted weight yarn - White', quantity: '20g', notes: 'Belly' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 12mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
    ],
    colors: ['Blue', 'White'],
    specialNotes: ['Stuff the body firmly for a plump whale shape'],
  },
  
  octopus: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 8 }, color: 'Purple (MC)' },
      { name: 'Tentacle', shape: 'cylinder', quantity: 8, dimensions: { diameter: 1.5, height: 10 }, color: 'MC', attachTo: 'Head', attachmentNotes: 'Space evenly around bottom of head' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn', quantity: '120g', notes: 'Any color' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 12mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
    ],
    colors: ['Purple'],
    specialNotes: ['Tentacles should be stuffed lightly so they can curl'],
  },
  
  bear: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 6 }, color: 'Brown (MC)' },
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 5, height: 8 }, color: 'MC' },
      { name: 'Ear', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 3 }, color: 'MC', attachTo: 'Head' },
      { name: 'Arm', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 5 }, color: 'MC', attachTo: 'Body' },
      { name: 'Leg', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2.5, height: 4 }, color: 'MC', attachTo: 'Body' },
      { name: 'Muzzle', shape: 'flat_circle', quantity: 1, dimensions: { diameter: 3 }, color: 'Cream (CC)', attachTo: 'Head' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn - Brown', quantity: '80g', notes: 'Main color' },
      { type: 'yarn', name: 'Worsted weight yarn - Cream', quantity: '10g', notes: 'Muzzle' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 9mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
      { type: 'notions', name: 'Black embroidery thread', quantity: 'Small amount', notes: 'For nose' },
    ],
    colors: ['Brown', 'Cream'],
    specialNotes: ['Fold ears in half before attaching for dimension'],
  },
  
  bunny: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 6 }, color: 'White (MC)' },
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 5, height: 7 }, color: 'MC' },
      { name: 'Ear', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 6 }, color: 'MC', attachTo: 'Head', attachmentNotes: 'Flatten for floppy ears' },
      { name: 'Arm', shape: 'cylinder', quantity: 2, dimensions: { diameter: 1.5, height: 4 }, color: 'MC', attachTo: 'Body' },
      { name: 'Leg', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 4 }, color: 'MC', attachTo: 'Body' },
      { name: 'Tail', shape: 'sphere', quantity: 1, dimensions: { diameter: 2 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Attach to back bottom' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn', quantity: '70g', notes: 'White, gray, or brown' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 9mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
      { type: 'notions', name: 'Pink embroidery thread', quantity: 'Small amount', notes: 'For nose' },
    ],
    colors: ['White'],
    specialNotes: ['Flatten ears and let them flop for a cute look'],
  },
  
  cat: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 6 }, color: 'Orange (MC)' },
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 4, height: 7 }, color: 'MC' },
      { name: 'Ear', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 2.5 }, color: 'MC', attachTo: 'Head', attachmentNotes: 'Fold into triangle shapes' },
      { name: 'Arm', shape: 'cylinder', quantity: 2, dimensions: { diameter: 1.5, height: 4 }, color: 'MC', attachTo: 'Body' },
      { name: 'Leg', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 3 }, color: 'MC', attachTo: 'Body' },
      { name: 'Tail', shape: 'cylinder', quantity: 1, dimensions: { diameter: 1, height: 8 }, color: 'MC', attachTo: 'Body', attachmentNotes: 'Curve slightly' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn', quantity: '60g', notes: 'Orange, black, white, or gray' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 9mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
      { type: 'notions', name: 'Pink and black embroidery thread', quantity: 'Small amount' },
    ],
    colors: ['Orange'],
    specialNotes: ['Fold ear circles into triangles and pinch at base'],
  },
  
  dog: {
    difficulty: 'easy',
    category: 'Amigurumi',
    sections: [
      { name: 'Head', shape: 'sphere', quantity: 1, dimensions: { diameter: 6 }, color: 'Brown (MC)' },
      { name: 'Snout', shape: 'cylinder', quantity: 1, dimensions: { diameter: 3, height: 2 }, color: 'MC', attachTo: 'Head' },
      { name: 'Body', shape: 'amigurumi_body', quantity: 1, dimensions: { width: 5, height: 8 }, color: 'MC' },
      { name: 'Ear', shape: 'flat_circle', quantity: 2, dimensions: { diameter: 3 }, color: 'MC', attachTo: 'Head', attachmentNotes: 'Floppy ears' },
      { name: 'Arm', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 5 }, color: 'MC', attachTo: 'Body' },
      { name: 'Leg', shape: 'cylinder', quantity: 2, dimensions: { diameter: 2, height: 4 }, color: 'MC', attachTo: 'Body' },
      { name: 'Tail', shape: 'cylinder', quantity: 1, dimensions: { diameter: 1.5, height: 4 }, color: 'MC', attachTo: 'Body' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn', quantity: '80g', notes: 'Brown, white, black, or mixed' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Safety eyes 12mm', quantity: '2' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: '1 bag' },
      { type: 'notions', name: 'Black embroidery thread', quantity: 'Small amount' },
    ],
    colors: ['Brown'],
    specialNotes: ['Stuff snout lightly and flatten slightly'],
  },
};

// ============================================================
// OBJECT TEMPLATES
// ============================================================

export const OBJECT_TEMPLATES: Record<string, any> = {
  ball: {
    difficulty: 'beginner',
    category: 'Amigurumi',
    sections: [
      { name: 'Ball', shape: 'sphere', quantity: 1, dimensions: { diameter: 6 }, color: 'Any color' },
    ],
    materials: [
      { type: 'yarn', name: 'Worsted weight yarn', quantity: '50g', notes: 'Any color' },
      { type: 'hook', name: 'Crochet hook 4.0mm (G/6)', quantity: '1' },
      { type: 'notions', name: 'Fiberfill stuffing', quantity: 'Small amount' },
    ],
    colors: ['Any'],
    specialNotes: ['Stuff firmly for round shape'],
  },
  
  coaster: {
    difficulty: 'beginner',
    category: 'Home Decor',
    sections: [
      { name: 'Coaster', shape: 'flat_circle', quantity: 4, dimensions: { diameter: 10 }, color: 'Any color' },
    ],
    materials: [
      { type: 'yarn', name: 'Cotton yarn (worsted weight)', quantity: '100g', notes: 'Cotton is absorbent' },
      { type: 'hook', name: 'Crochet hook 5.0mm (H/8)', quantity: '1' },
    ],
    colors: ['Any'],
    specialNotes: ['Block for extra flatness', 'Make sets of 4-6'],
  },
  
  basket: {
    difficulty: 'easy',
    category: 'Home Decor',
    sections: [
      { name: 'Basket', shape: 'cylinder', quantity: 1, dimensions: { diameter: 12, height: 10 }, color: 'Natural' },
    ],
    materials: [
      { type: 'yarn', name: 'Bulky cotton or t-shirt yarn', quantity: '200g' },
      { type: 'hook', name: 'Crochet hook 8.0mm (L/11)', quantity: '1' },
    ],
    colors: ['Natural'],
    specialNotes: ['Work tightly for stiff sides'],
  },
};

// ============================================================
// SHAPE GENERATORS
// ============================================================

function generateSphere(diameter: number, stitchType: StitchType = 'sc', stagger: boolean = true): any {
  const baseCount = STITCH_PROPERTIES[stitchType].baseCount;
  const totalRounds = Math.ceil(diameter * 2);
  const maxStitches = baseCount * Math.ceil(diameter / 2);
  const rounds: any[] = [];
  
  // Magic ring
  rounds.push({
    number: 1,
    instruction: `Magic ring, ${baseCount} sc into ring. Pull tight. (${baseCount})`,
    stitchCount: baseCount,
  });
  
  // Increase rounds (first half)
  let currentStitches = baseCount;
  let roundNum = 2;
  
  while (currentStitches < maxStitches) {
    const targetStitches = Math.min(currentStitches + baseCount, maxStitches);
    const increases = targetStitches - currentStitches;
    const spacing = Math.floor(currentStitches / increases) - 1;
    
    let instruction = '';
    if (spacing === 0) {
      instruction = `[inc] x ${increases} (${targetStitches})`;
    } else if (stagger && roundNum % 2 === 0 && spacing > 1) {
      const firstHalf = Math.floor(spacing / 2);
      const secondHalf = spacing - firstHalf;
      instruction = `sc ${firstHalf}, inc, [sc ${spacing}, inc] x ${increases - 1}, sc ${secondHalf} (${targetStitches})`;
    } else {
      instruction = `[sc ${spacing}, inc] x ${increases} (${targetStitches})`;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. ${instruction}`,
      stitchCount: targetStitches,
    });
    
    currentStitches = targetStitches;
    roundNum++;
  }
  
  // Middle rounds (equator)
  const middleRounds = Math.max(2, Math.floor(diameter / 3));
  for (let i = 0; i < middleRounds; i++) {
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. sc in each st around (${currentStitches})`,
      stitchCount: currentStitches,
      notes: i === 0 ? 'Insert safety eyes between rounds 6-8' : undefined,
    });
    roundNum++;
  }
  
  // Decrease rounds (second half)
  while (currentStitches > baseCount) {
    const targetStitches = Math.max(currentStitches - baseCount, baseCount);
    const decreases = currentStitches - targetStitches;
    const spacing = Math.floor(currentStitches / decreases) - 1;
    
    let instruction = '';
    if (spacing === 0) {
      instruction = `[dec] x ${decreases} (${targetStitches})`;
    } else {
      instruction = `[sc ${spacing}, dec] x ${decreases} (${targetStitches})`;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. ${instruction}`,
      stitchCount: targetStitches,
      notes: currentStitches - baseCount <= baseCount * 2 ? 'Stuff firmly before closing' : undefined,
    });
    
    currentStitches = targetStitches;
    roundNum++;
  }
  
  // Close
  rounds.push({
    number: roundNum,
    instruction: `Rnd ${roundNum}. [dec] x ${currentStitches / 2}, fasten off. Weave tail through remaining stitches and pull tight.`,
    stitchCount: 0,
  });
  
  return { rounds, shape: 'sphere' };
}

function generateFlatCircle(diameter: number, stitchType: StitchType = 'sc', stagger: boolean = true): any {
  const baseCount = STITCH_PROPERTIES[stitchType].baseCount;
  const totalRounds = Math.ceil(diameter / 2) + 1;
  const rounds: any[] = [];
  
  // Magic ring
  rounds.push({
    number: 1,
    instruction: `Magic ring, ${baseCount} sc into ring. Pull tight. (${baseCount})`,
    stitchCount: baseCount,
  });
  
  // Increase rounds
  let currentStitches = baseCount;
  
  for (let roundNum = 2; roundNum <= totalRounds; roundNum++) {
    const targetStitches = currentStitches + baseCount;
    const increases = baseCount;
    const spacing = roundNum - 2;
    
    let instruction = '';
    if (spacing === 0) {
      instruction = `[inc] x ${increases} (${targetStitches})`;
    } else if (stagger && roundNum % 2 === 0) {
      const firstHalf = Math.floor(spacing / 2);
      const secondHalf = spacing - firstHalf;
      instruction = `sc ${firstHalf}, inc, [sc ${spacing}, inc] x ${increases - 1}, sc ${secondHalf} (${targetStitches})`;
    } else {
      instruction = `[sc ${spacing}, inc] x ${increases} (${targetStitches})`;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. ${instruction}`,
      stitchCount: targetStitches,
    });
    
    currentStitches = targetStitches;
  }
  
  // Final round
  rounds.push({
    number: totalRounds + 1,
    instruction: `Rnd ${totalRounds + 1}. sl st in next st, fasten off. Weave in ends.`,
    stitchCount: currentStitches,
  });
  
  return { rounds, shape: 'flat_circle' };
}

function generateCylinder(diameter: number, height: number, stitchType: StitchType = 'sc', closedBottom: boolean = true, closedTop: boolean = false): any {
  const baseCount = STITCH_PROPERTIES[stitchType].baseCount;
  const circumference = baseCount * Math.ceil(diameter / 2);
  const heightRounds = Math.ceil(height * 1.5);
  const rounds: any[] = [];
  let roundNum = 1;
  
  if (closedBottom) {
    // Magic ring
    rounds.push({
      number: roundNum,
      instruction: `Magic ring, ${baseCount} sc into ring. Pull tight. (${baseCount})`,
      stitchCount: baseCount,
    });
    roundNum++;
    
    // Increase to circumference
    let currentStitches = baseCount;
    while (currentStitches < circumference) {
      const targetStitches = Math.min(currentStitches + baseCount, circumference);
      const increases = targetStitches - currentStitches;
      const spacing = Math.floor(currentStitches / increases) - 1;
      
      let instruction = spacing === 0 
        ? `[inc] x ${increases} (${targetStitches})`
        : `[sc ${spacing}, inc] x ${increases} (${targetStitches})`;
      
      rounds.push({
        number: roundNum,
        instruction: `Rnd ${roundNum}. ${instruction}`,
        stitchCount: targetStitches,
      });
      
      currentStitches = targetStitches;
      roundNum++;
    }
  } else {
    // Chain start
    rounds.push({
      number: roundNum,
      instruction: `Ch ${circumference}, join with sl st to form ring. (${circumference})`,
      stitchCount: circumference,
    });
    roundNum++;
  }
  
  // Height rounds
  for (let i = 0; i < heightRounds; i++) {
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. sc in each st around (${circumference})`,
      stitchCount: circumference,
      notes: i === heightRounds - 2 ? 'Stuff lightly' : undefined,
    });
    roundNum++;
  }
  
  if (closedTop) {
    // Decrease to close
    let currentStitches = circumference;
    while (currentStitches > baseCount) {
      const targetStitches = Math.max(currentStitches - baseCount, baseCount);
      const decreases = currentStitches - targetStitches;
      const spacing = Math.floor(currentStitches / decreases) - 1;
      
      let instruction = spacing === 0 
        ? `[dec] x ${decreases} (${targetStitches})`
        : `[sc ${spacing}, dec] x ${decreases} (${targetStitches})`;
      
      rounds.push({
        number: roundNum,
        instruction: `Rnd ${roundNum}. ${instruction}`,
        stitchCount: targetStitches,
      });
      
      currentStitches = targetStitches;
      roundNum++;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. [dec] x ${Math.floor(baseCount / 2)}, fasten off. Weave tail through remaining stitches.`,
      stitchCount: 0,
    });
  } else {
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. sl st in next st, fasten off. Leave long tail for sewing.`,
      stitchCount: circumference,
    });
  }
  
  return { rounds, shape: 'cylinder' };
}

function generateAmigurumiBody(height: number, width: number, stitchType: StitchType = 'sc', stagger: boolean = true): any {
  const baseCount = STITCH_PROPERTIES[stitchType].baseCount;
  const maxStitches = baseCount * Math.ceil(width / 2);
  const totalRounds = Math.ceil(height * 1.5);
  const rounds: any[] = [];
  
  // Magic ring
  rounds.push({
    number: 1,
    instruction: `Magic ring, ${baseCount} sc into ring. Pull tight. (${baseCount})`,
    stitchCount: baseCount,
  });
  
  let currentStitches = baseCount;
  let roundNum = 2;
  
  // Increase phase (first 40%)
  const increaseRounds = Math.floor(totalRounds * 0.4);
  for (let i = 0; i < increaseRounds && currentStitches < maxStitches; i++) {
    const targetStitches = Math.min(currentStitches + baseCount, maxStitches);
    const increases = targetStitches - currentStitches;
    const spacing = Math.floor(currentStitches / increases) - 1;
    
    let instruction = '';
    if (spacing === 0) {
      instruction = `[inc] x ${increases} (${targetStitches})`;
    } else if (stagger && roundNum % 2 === 0) {
      const firstHalf = Math.floor(spacing / 2);
      const secondHalf = spacing - firstHalf;
      instruction = `sc ${firstHalf}, inc, [sc ${spacing}, inc] x ${increases - 1}, sc ${secondHalf} (${targetStitches})`;
    } else {
      instruction = `[sc ${spacing}, inc] x ${increases} (${targetStitches})`;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. ${instruction}`,
      stitchCount: targetStitches,
    });
    
    currentStitches = targetStitches;
    roundNum++;
  }
  
  // Middle phase (40%)
  const middleRounds = Math.floor(totalRounds * 0.3);
  for (let i = 0; i < middleRounds; i++) {
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. sc in each st around (${currentStitches})`,
      stitchCount: currentStitches,
      notes: i === 0 ? 'Insert safety eyes if needed' : undefined,
    });
    roundNum++;
  }
  
  // Decrease phase (30%)
  while (currentStitches > baseCount) {
    const targetStitches = Math.max(currentStitches - baseCount, baseCount);
    const decreases = currentStitches - targetStitches;
    const spacing = Math.floor(currentStitches / decreases) - 1;
    
    let instruction = '';
    if (spacing === 0) {
      instruction = `[dec] x ${decreases} (${targetStitches})`;
    } else {
      instruction = `[sc ${spacing}, dec] x ${decreases} (${targetStitches})`;
    }
    
    rounds.push({
      number: roundNum,
      instruction: `Rnd ${roundNum}. ${instruction}`,
      stitchCount: targetStitches,
      notes: currentStitches - baseCount <= baseCount * 2 ? 'Stuff firmly before closing' : undefined,
    });
    
    currentStitches = targetStitches;
    roundNum++;
  }
  
  rounds.push({
    number: roundNum,
    instruction: `Rnd ${roundNum}. [dec] x ${Math.floor(currentStitches / 2)}, fasten off. Weave tail through remaining stitches.`,
    stitchCount: 0,
  });
  
  return { rounds, shape: 'amigurumi_body' };
}

// ============================================================
// MAIN GENERATION FUNCTION
// ============================================================

function parsePrompt(prompt: string): { type: string; size: number; template: any | null } {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract size
  let size = 6;
  const inchMatch = lowerPrompt.match(/(\d+)\s*(inch|in|")/);
  const cmMatch = lowerPrompt.match(/(\d+)\s*(cm|centimeter)/);
  
  if (inchMatch) {
    size = parseInt(inchMatch[1], 10);
  } else if (cmMatch) {
    size = Math.round(parseInt(cmMatch[1], 10) / 2.54);
  }
  
  // Find template
  let foundType = '';
  let foundTemplate: any = null;
  
  for (const [animal, template] of Object.entries(ANIMAL_TEMPLATES)) {
    if (lowerPrompt.includes(animal)) {
      foundType = animal;
      foundTemplate = template;
      break;
    }
  }
  
  if (!foundTemplate) {
    for (const [object, template] of Object.entries(OBJECT_TEMPLATES)) {
      if (lowerPrompt.includes(object)) {
        foundType = object;
        foundTemplate = template;
        break;
      }
    }
  }
  
  return { type: foundType, size, template: foundTemplate };
}

function scaleTemplate(template: any, targetSizeInches: number): any {
  let maxDim = 0;
  for (const section of template.sections) {
    const dims = section.dimensions;
    if (dims.diameter && dims.diameter > maxDim) maxDim = dims.diameter;
    if (dims.height && dims.height > maxDim) maxDim = dims.height;
    if (dims.width && dims.width > maxDim) maxDim = dims.width;
  }
  
  const targetCm = targetSizeInches * 2.54;
  const scale = targetCm / maxDim;
  
  const scaledSections = template.sections.map((section: any) => ({
    ...section,
    dimensions: {
      diameter: section.dimensions.diameter ? Math.round(section.dimensions.diameter * scale) : undefined,
      width: section.dimensions.width ? Math.round(section.dimensions.width * scale) : undefined,
      height: section.dimensions.height ? Math.round(section.dimensions.height * scale) : undefined,
    },
  }));
  
  return { ...template, sections: scaledSections };
}

export async function generatePatternFromPrompt(request: PatternRequest): Promise<GeneratedPatternResult> {
  try {
    const parsed = parsePrompt(request.prompt);
    
    if (!parsed.template) {
      return {
        success: false,
        error: `I couldn't recognize the project type. Try: manatee, whale, bear, bunny, cat, dog, octopus, ball, coaster, basket. Example: "6 inch manatee"`,
      };
    }
    
    const scaledTemplate = scaleTemplate(parsed.template, parsed.size);
    const sections: GeneratedSection[] = [];
    const assembly: string[] = [];
    
    for (const sectionDef of scaledTemplate.sections) {
      let patternSection;
      
      switch (sectionDef.shape) {
        case 'sphere':
          patternSection = generateSphere(sectionDef.dimensions.diameter || 6, 'sc', true);
          break;
        case 'amigurumi_body':
          patternSection = generateAmigurumiBody(sectionDef.dimensions.height || 8, sectionDef.dimensions.width || 5, 'sc', true);
          break;
        case 'flat_circle':
          patternSection = generateFlatCircle(sectionDef.dimensions.diameter || 6, 'sc', true);
          break;
        case 'cylinder':
          patternSection = generateCylinder(sectionDef.dimensions.diameter || 3, sectionDef.dimensions.height || 5, 'sc', true, true);
          break;
        default:
          patternSection = generateSphere(6, 'sc', true);
      }
      
      const rounds = patternSection.rounds.map((r: any) => {
        let line = `Rnd ${r.number}. ${r.instruction}`;
        if (r.notes) line += `\n  *${r.notes}`;
        return line;
      });
      
      const tips: string[] = [];
      if (sectionDef.shape === 'sphere' || sectionDef.shape === 'amigurumi_body') {
        tips.push('Stuff firmly as you go.');
      }
      if (sectionDef.shape === 'flat_circle' && sectionDef.attachmentNotes?.includes('fold')) {
        tips.push('Fold in half before attaching.');
      }
      
      sections.push({
        name: sectionDef.name,
        quantity: sectionDef.quantity,
        colorNote: sectionDef.color,
        rounds,
        stitchCount: patternSection.rounds[patternSection.rounds.length - 1]?.stitchCount || 0,
        tips,
      });
      
      if (sectionDef.attachTo) {
        assembly.push(`ATTACH ${sectionDef.name.toUpperCase()} TO ${sectionDef.attachTo.toUpperCase()}`);
        if (sectionDef.attachmentNotes) {
          assembly.push(`  - ${sectionDef.attachmentNotes}`);
        }
        assembly.push('');
      }
    }
    
    assembly.push('FINISHING');
    assembly.push('- Weave in all ends securely');
    assembly.push('- Shape and fluff as needed');
    
    const totalRounds = sections.reduce((sum, s) => sum + s.rounds.length * s.quantity, 0);
    const minutes = totalRounds * 2;
    const hours = Math.floor(minutes / 60);
    const estimatedTime = hours > 0 ? `${hours}-${hours + 1} hours` : `${minutes} minutes`;
    
    const displayName = parsed.type.charAt(0).toUpperCase() + parsed.type.slice(1);
    const title = `${parsed.size}" ${displayName} Amigurumi`;
    const description = `A cute ${parsed.size}-inch ${parsed.type} - ${request.prompt}`;
    
    const content = generateMarkdownContent({
      title,
      description,
      difficulty: scaledTemplate.difficulty,
      finishedSize: `Approximately ${parsed.size}" (${Math.round(parsed.size * 2.54)}cm)`,
      materials: scaledTemplate.materials,
      sections,
      assembly,
      designerNotes: scaledTemplate.specialNotes,
      estimatedTime,
    });
    
    return {
      success: true,
      pattern: {
        id: `ai-${Date.now()}`,
        title,
        description,
        difficulty: request.difficulty || scaledTemplate.difficulty,
        category: scaledTemplate.category,
        finishedSize: `Approximately ${parsed.size}" (${Math.round(parsed.size * 2.54)}cm)`,
        materials: scaledTemplate.materials,
        gauge: '14 sc × 16 rows = 4" (10cm)',
        abbreviations: [
          { abbr: 'sc', full: 'single crochet' },
          { abbr: 'inc', full: 'increase (2 sc in same st)' },
          { abbr: 'dec', full: 'invisible decrease' },
          { abbr: 'sl st', full: 'slip stitch' },
          { abbr: 'ch', full: 'chain' },
          { abbr: 'st(s)', full: 'stitch(es)' },
          { abbr: 'rnd', full: 'round' },
        ],
        sections,
        assembly,
        designerNotes: scaledTemplate.specialNotes,
        estimatedTime,
        content,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate pattern',
    };
  }
}

function generateMarkdownContent(data: any): string {
  let md = `# ${data.title}\n\n`;
  md += `${data.description}\n\n`;
  md += `**Difficulty:** ${data.difficulty}\n`;
  md += `**Estimated Time:** ${data.estimatedTime}\n`;
  md += `**Finished Size:** ${data.finishedSize}\n\n`;
  
  md += `---\n\n## Materials\n\n`;
  for (const mat of data.materials) {
    md += `- **${mat.name}**: ${mat.quantity}`;
    if (mat.notes) md += ` *(${mat.notes})*`;
    md += '\n';
  }
  
  md += `\n---\n\n## Pattern Instructions\n\n`;
  
  for (const section of data.sections) {
    md += `### ${section.name}`;
    if (section.quantity > 1) md += ` (Make ${section.quantity})`;
    if (section.colorNote) md += ` - ${section.colorNote}`;
    md += `\n\n\`\`\`\n`;
    for (const round of section.rounds) {
      md += round + '\n';
    }
    md += '```\n\n';
  }
  
  md += `---\n\n## Assembly\n\n`;
  for (const step of data.assembly) {
    md += `${step}\n`;
  }
  
  if (data.designerNotes?.length > 0) {
    md += `\n---\n\n## Designer Notes\n\n`;
    for (const note of data.designerNotes) {
      md += `- ${note}\n`;
    }
  }
  
  md += `\n---\n\n*Pattern generated by CrochetAI - CR AudioViz AI*\n`;
  
  return md;
}
