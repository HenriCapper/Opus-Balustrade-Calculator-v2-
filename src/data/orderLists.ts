import type {
  LayoutCalculationInput,
  LayoutCalculationResult,
  OrderListItem,
} from '@/store/useLayoutStore';
import type { CalcKey } from '@/data/calcOptions';

type FinishCode = 'SS' | 'PS' | 'BK' | 'PC';

type BuildContext = {
  calcKey: CalcKey;
  input: LayoutCalculationInput;
  result: LayoutCalculationResult;
};

const FINISH_CODE_MAP: Record<string, FinishCode> = {
  SSS: 'SS',
  SS: 'SS',
  SATINSTAINLESS: 'SS',
  PSS: 'PS',
  PS: 'PS',
  POLISHEDSTAINLESS: 'PS',
  BLACK: 'BK',
  BK: 'BK',
  POWDERCOAT: 'PC',
  PC: 'PC',
};

const SP12_FIXING_KITS: Record<string, string> = {
  'Concrete': 'SP12FK-1',
  'Steel': 'SP12FK-2',
  'Timber (Coach Screw)': 'SP12FK-3',
  'Timber (Bolt Through)': 'SP12FK-4',
};

const HANDRAIL_GASKETS: Record<string, string> = {
  S25: 'S25GR',
  S40: 'S40GR1',
  AH40: 'AHGR1',
  R40: 'R40GR1',
};

const WALL_ATTACHMENT_CODES: Record<string, { left?: string; right?: string; pair?: string }> = {
  S25: { left: 'S25WAL', right: 'S25WAR' },
  S40: { left: 'S40WAL', right: 'S40WAR' },
  R40: { pair: 'R40WA' },
  AH40: { pair: 'AHWB' },
};

const SD50_DISC_HEADS = new Set(['SD50-SH', 'SD50-FH', 'SD50-BH', 'ASD50-SH']);
const SD50_POWDERCOAT_DIRECT_HEADS = new Set(['SD50-BH', 'SD50-FH']);
const PF150_HEADS = new Set(['PF150', 'PF150R', 'PF150S']);
const PF150_FIX_KITS: Record<string, string> = {
  'Concrete (Single Fix)': 'PFFK-C-2',
  'Concrete (Double Fix)': 'PFFK-C-1',
  'Steel (Single Fix)': 'PFFK-S-2',
  'Steel (Double Fix)': 'PFFK-S-1',
  'Timber Bolt Through (Single Fix)': 'PFFK-BT-2',
  'Timber Bolt Through (Double Fix)': 'PFFK-BT-1',
  'Timber Coach Screw (Single Fix)': 'PFFK-TC-2',
  'Timber Coach Screw (Double Fix)': 'PFFK-TC-1',
};

const BASE_DESCRIPTIONS: Record<string, string> = {
  SP12: 'SP12 Side Fix Post',
  'SP12FK-1': 'SP12 Concrete Fixing Kit',
  'SP12FK-2': 'SP12 Steel Fixing Kit',
  'SP12FK-3': 'SP12 Timber Fixing Kit (Coach Screw)',
  'SP12FK-4': 'SP12 Timber Fixing Kit (Through Bolt)',
  'SD50-SH': 'SD50 Screw Head Standoff Disc',
  'SD50-FH': 'SD50 Flat Head Standoff Disc',
  'SD50-BH': 'SD50 Bevelled Head Standoff Disc',
  'ASD50-SH': 'Adjustable Screw Head Standoff Disc',
  'ASD50-FH': 'Adjustable Flat Head Standoff Disc',
  'ASD50-BH': 'Adjustable Bevelled Head Standoff Disc',
  'SD75-SS': 'SD75 Standoff Disc – Stainless',
  'SD75-PS': 'SD75 Standoff Disc – Polished Stainless',
  'SD75-BK': 'SD75 Standoff Disc – Black',
  'SD100-SS': 'SD100 Standoff Disc – Stainless',
  'SD100-PS': 'SD100 Standoff Disc – Polished Stainless',
  'SD100-BK': 'SD100 Standoff Disc – Black',
  PF150: 'PF150 Clamp – Standard',
  PF150R: 'PF150 Clamp – Concealed',
  PF150S: 'PF150 Clamp – Square',
  'PFFK-C-1': 'PF150 Concrete Fixing Kit – Double Fix',
  'PFFK-C-2': 'PF150 Concrete Fixing Kit – Single Fix',
  'PFFK-S-1': 'PF150 Steel Fixing Kit – Double Fix',
  'PFFK-S-2': 'PF150 Steel Fixing Kit – Single Fix',
  'PFFK-BT-1': 'PF150 Timber Bolt Through Fixing Kit – Double Fix',
  'PFFK-BT-2': 'PF150 Timber Bolt Through Fixing Kit – Single Fix',
  'PFFK-TC-1': 'PF150 Timber Coach Screw Fixing Kit – Double Fix',
  'PFFK-TC-2': 'PF150 Timber Coach Screw Fixing Kit – Single Fix',
  SL120B12: 'Smart Lock Channel Base/Top Fix Kit – 12mm Glass (3.0m)',
  SL120B13: 'Smart Lock Channel Base/Top Fix Kit – 13.52mm Glass (3.0m)',
  SL120B15: 'Smart Lock Channel Base/Top Fix Kit – 15mm Glass (3.0m)',
  SL120B17: 'Smart Lock Channel Base/Top Fix Kit – 17.52mm Glass (3.0m)',
  SL120B19: 'Smart Lock Channel Base/Top Fix Kit – 19mm Glass (3.0m)',
  SL120B21: 'Smart Lock Channel Base/Top Fix Kit – 21.52mm Glass (3.0m)',
  SL120S12: 'Smart Lock Channel Side Fix Kit – 12mm Glass (3.0m)',
  SL120S13: 'Smart Lock Channel Side Fix Kit – 13.52mm Glass (3.0m)',
  SL120S15: 'Smart Lock Channel Side Fix Kit – 15mm Glass (3.0m)',
  SL120S17: 'Smart Lock Channel Side Fix Kit – 17.52mm Glass (3.0m)',
  SL120S19: 'Smart Lock Channel Side Fix Kit – 19mm Glass (3.0m)',
  SL120S21: 'Smart Lock Channel Side Fix Kit – 21.52mm Glass (3.0m)',
  'LC48KIT1-L': 'Lugano Channel Kit 4.8m – 12mm Glass Timber Lag Fix',
  'LC48KIT1-T': 'Lugano Channel Kit 4.8m – 12mm Glass Timber Bolt Through Fix',
  'LC48KIT1-C': 'Lugano Channel Kit 4.8m – 12mm Glass Concrete Fix',
  'LC48KIT1-S': 'Lugano Channel Kit 4.8m – 12mm Glass Steel Fix',
  'LC48KIT2-L': 'Lugano Channel Kit 4.8m – 13.52mm Glass Timber Lag Fix',
  'LC48KIT2-T': 'Lugano Channel Kit 4.8m – 13.52mm Glass Timber Bolt Through Fix',
  'LC48KIT2-C': 'Lugano Channel Kit 4.8m – 13.52mm Glass Concrete Fix',
  'LC48KIT2-S': 'Lugano Channel Kit 4.8m – 13.52mm Glass Steel Fix',
  'VC48KIT-L': 'Vista Channel Kit 4.8m – Timber Lag Fix (12–17.52mm Glass)',
  'VC48KIT-T': 'Vista Channel Kit 4.8m – Timber Bolt Through Fix (12–17.52mm Glass)',
  'VC48KIT-C': 'Vista Channel Kit 4.8m – Concrete Fix (12–17.52mm Glass)',
  'VC48KIT-S': 'Vista Channel Kit 4.8m – Steel Fix (12–17.52mm Glass)',
  S25: 'S25 Square Handrail (25x25mm)',
  S40: 'S40 Square Handrail (40x40mm)',
  R40: 'R40 Round Handrail (40mm dia)',
  AH40: 'AH40 Aluminium Handrail',
  S25GR: 'S25 Handrail Gasket',
  S40GR1: 'S40 Handrail Gasket',
  AHGR1: 'AH40 Handrail Gasket',
  R40GR1: 'R40 Handrail Gasket',
  S25J180: 'S25 Straight Joiner (180°)',
  S40J180: 'S40 Straight Joiner (180°)',
  R40J180: 'R40 Straight Joiner (180°)',
  S25J90: 'S25 90° Corner Joiner',
  S40J90: 'S40 90° Corner Joiner',
  R40J90: 'R40 90° Corner Joiner',
  AHJ180: 'AH40 Straight Joiner (180°)',
  AHJ90: 'AH40 90° Corner Joiner',
  S25WAL: 'S25 Wall Attachment Left',
  S25WAR: 'S25 Wall Attachment Right',
  S40WAL: 'S40 Wall Attachment Left',
  S40WAR: 'S40 Wall Attachment Right',
  R40WA: 'R40 Wall Attachment',
  AHWB: 'AH40 Wall Bracket',
  S25EC: 'S25 Handrail Endcap',
  S40EC: 'S40 Handrail Endcap',
  R40EC: 'R40 Handrail Endcap',
  AHEC: 'AH40 Handrail Endcap',
  'PC-BRACKET': 'Powdercoat – Brackets & Joiners',
  'PC-PERM': 'Powdercoat – Handrail (per m)',
  'PC-ENDCAP': 'Powdercoat – Handrail Endcaps',
  'PC1-DISC': 'Disc Powdercoating',
  ASC180: 'Glass-to-Glass Gate Hinge (ASC180)',
  ASC90: 'Wall-to-Glass Gate Hinge (ASC90)',
  PL180GG: 'Glass-to-Glass Gate Latch (PL180GG)',
  PL090WG: 'Glass-to-Wall Gate Latch (PL090WG)',
  'TR10-140': 'Concrete Anchor M10 x 140mm',
  'TR10-60': 'Steel Fixing Bolt M10 x 60mm',
  'TR10-150': 'Timber Bolt M10 x 150mm',
  'HN-M10': 'Hex Nut M10',
  'TR12-180': 'Threaded Rod M12 x 180mm',
  'TR12-150': 'Threaded Rod M12 x 150mm',
  'TR12-50': 'Threaded Rod M12 x 50mm',
  'HN-M12': 'Hex Nut M12',
  'FW-M1224': 'Flat Washer M10/M12',
  'FWSQ-M12-G': 'Square Washer Galvanised',
  'LS12-140': 'Lag Screw M12 x 140mm',
  'LS10-100': 'Lag Screw M10 x 100mm',
  TL2650: 'LocTite Adhesive',
  'SIKA-NSG30': 'SIKA Nailbond Supergrip Adhesive (30 min)',
  'FG75-08': 'Fiber Gasket 75mm x 0.8mm',
  'FG50-08': 'Fiber Gasket 50mm x 0.8mm',
  'FG100-08': 'Fiber Gasket 100mm x 0.8mm',
  'FG150-08': 'Clamp Gasket 150mm x 0.8mm',
};

const SMARTLOCK_BASE_CODES: Record<string, string> = {
  '12': 'SL120B12',
  '13.52': 'SL120B13',
  '15': 'SL120B15',
  '17.52': 'SL120B17',
  '19': 'SL120B19',
  '21.52': 'SL120B21',
};

const SMARTLOCK_SIDE_CODES: Record<string, string> = {
  '12': 'SL120S12',
  '13.52': 'SL120S13',
  '15': 'SL120S15',
  '17.52': 'SL120S17',
  '19': 'SL120S19',
  '21.52': 'SL120S21',
};

const LUGANO_KIT_CODES: Record<string, Record<string, string>> = {
  '12': {
    'Timber (Coach Screw)': 'LC48KIT1-L',
    'Timber (Bolt Through)': 'LC48KIT1-T',
    Concrete: 'LC48KIT1-C',
    Steel: 'LC48KIT1-S',
  },
  '13.52': {
    'Timber (Coach Screw)': 'LC48KIT2-L',
    'Timber (Bolt Through)': 'LC48KIT2-T',
    Concrete: 'LC48KIT2-C',
    Steel: 'LC48KIT2-S',
  },
};

const VISTA_KIT_CODES: Record<string, string> = {
  'Timber (Coach Screw)': 'VC48KIT-L',
  'Timber (Bolt Through)': 'VC48KIT-T',
  Concrete: 'VC48KIT-C',
  Steel: 'VC48KIT-S',
};

const SMARTLOCK_KIT_LENGTH_MM = 3000;
const CHANNEL_KIT_LENGTH_MM = 4800;
const VISTA_SUPPORTED_THICKNESSES = new Set(['12', '13.52', '15', '17.52']);

const FINISH_SUFFIX_PATTERN = /-(SS|PS|BK|MILL)$/i;
const POWDERCOAT_SUFFIX_PATTERN = /-PC(?:-[A-Za-z0-9]+)?$/i;

const BUILDERS: Partial<Record<CalcKey, (ctx: BuildContext) => OrderListItem[]>> = {
  sp12: buildSp12OrderList,
  sd50: buildSd50OrderList,
  pf150: buildPf150OrderList,
  sd75: buildSd75OrderList,
  sd100: buildSd100OrderList,
  smartlock_top: buildSmartLockTopOrderList,
  smartlock_side: buildSmartLockSideOrderList,
  lugano: buildLuganoOrderList,
  vista: buildVistaOrderList,
};

export function computeOrderList(
  calcKey: CalcKey | null,
  input?: LayoutCalculationInput | null,
  result?: LayoutCalculationResult | null,
): OrderListItem[] {
  if (!calcKey || !input || !result) return [];
  const builder = BUILDERS[calcKey];
  if (!builder) return [];
  return builder({ calcKey, input, result });
}

function buildSp12OrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const totalSpigots = result.totalSpigots ?? 0;
  if (totalSpigots <= 0) return items;

  const finishCode = normaliseFinish(input.finish);
  const postSuffix = finishCode === 'PC' ? 'SS' : finishCode;
  pushItem(items, `SP12-${postSuffix}`, totalSpigots);

  const fixingCode = input.fixingType ? SP12_FIXING_KITS[input.fixingType] : undefined;
  if (fixingCode) {
    pushItem(items, fixingCode, totalSpigots);
  }

  const gateHardware = tallyGateHardware(result);
  appendHandrailItems(items, input, result, finishCode, gateHardware.totalGates);

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
}

function buildSd50OrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const finishCode = normaliseFinish(input.finish);
  const discsQuantity = Math.round((result.totalSpigots ?? 0) * 100) / 100;
  const selectedHead = input.discHead && SD50_DISC_HEADS.has(input.discHead)
    ? input.discHead
    : 'SD50-SH';

  if (discsQuantity > 0) {
    if (finishCode === 'PC') {
      if (SD50_POWDERCOAT_DIRECT_HEADS.has(selectedHead)) {
        const finishSuffix = powdercoatFinishSuffix(input.powdercoatColor);
        pushItem(items, `${selectedHead}-${finishSuffix}`, discsQuantity);
      } else {
        pushItem(items, `${selectedHead}-SS`, discsQuantity);
        pushItem(items, powdercoatChargeCode('PC1-DISC', input.powdercoatColor), discsQuantity);
      }
    } else {
      pushItem(items, `${selectedHead}-${finishCode}`, discsQuantity);
    }

    const fixing = normaliseFixingType(input.fixingType);
    if (fixing === 'Concrete') {
      pushItem(items, 'TR10-140', discsQuantity);
    } else if (fixing === 'Steel') {
      pushItem(items, 'TR10-60', discsQuantity);
      pushItem(items, 'HN-M10', discsQuantity);
      pushItem(items, 'FW-M1224', discsQuantity);
      pushItem(items, 'TL2650', 1);
    } else if (fixing === 'Timber (Bolt Through)') {
      pushItem(items, 'TR10-150', discsQuantity);
      pushItem(items, 'HN-M10', discsQuantity);
      pushItem(items, 'FWSQ-M12-G', discsQuantity);
      pushItem(items, 'TL2650', 1);
    } else if (fixing === 'Timber (Coach Screw)') {
      pushItem(items, 'LS10-100', discsQuantity);
      const sikaQty = Math.max(1, Math.ceil(discsQuantity / 75));
      pushItem(items, 'SIKA-NSG30', sikaQty);
    }
  }

  const gateHardware = tallyGateHardware(result);
  appendHandrailItems(items, input, result, finishCode, gateHardware.totalGates);

  const extraPackers = typeof input.extraPackers === 'number' ? input.extraPackers : 0;
  if (extraPackers > 0) {
    pushItem(items, 'FG50-08', extraPackers);
  }

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
}

function buildPf150OrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const finishCode = normaliseFinish(input.finish);
  const isPowdercoat = finishCode === 'PC';
  const clampQuantity = Math.round((result.totalSpigots ?? 0) * 100) / 100;
  const selectedHead = input.discHead && PF150_HEADS.has(input.discHead)
    ? input.discHead
    : 'PF150';

  if (clampQuantity > 0) {
    if (isPowdercoat) {
      pushItem(items, `${selectedHead}-SS`, clampQuantity);
      pushItem(items, powdercoatChargeCode('PC1-DISC', input.powdercoatColor), clampQuantity);
    } else {
      pushItem(items, `${selectedHead}-${finishCode}`, clampQuantity);
    }

    const kitCode = resolvePf150FixKit(input.fixingType);
    if (kitCode) {
      pushItem(items, kitCode, clampQuantity);
    }
  }

  const gateHardware = tallyGateHardware(result);
  appendHandrailItems(items, input, result, finishCode, gateHardware.totalGates);

  const extraPackers = typeof input.extraPackers === 'number' ? input.extraPackers : 0;
  if (extraPackers > 0) {
    pushItem(items, 'FG150-08', extraPackers);
  }

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
}

function buildSd75OrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const finishCode = normaliseFinish(input.finish);
  const isPowdercoat = finishCode === 'PC';
  const discsQuantity = Math.round((result.totalSpigots ?? 0) * 100) / 100;

  if (discsQuantity > 0) {
    const discCode = isPowdercoat ? 'SD75-SS' : `SD75-${finishCode}`;
    pushItem(items, discCode, discsQuantity);
    if (isPowdercoat) {
      pushItem(items, powdercoatChargeCode('PC1-DISC', input.powdercoatColor), discsQuantity);
    }

    const fixing = normaliseFixingType(input.fixingType);
    if (fixing === 'Concrete') {
      pushItem(items, 'TR12-180', discsQuantity);
    } else if (fixing === 'Steel') {
      pushItem(items, 'TR12-50', discsQuantity);
      pushItem(items, 'HN-M12', discsQuantity);
      pushItem(items, 'FW-M1224', discsQuantity);
    } else if (fixing === 'Timber (Bolt Through)') {
      pushItem(items, 'TR12-150', discsQuantity);
      pushItem(items, 'HN-M12', discsQuantity);
      pushItem(items, 'FW-M1224', discsQuantity);
    } else if (fixing === 'Timber (Coach Screw)') {
      pushItem(items, 'LS12-140', discsQuantity);
    }
  }

  const gateHardware = tallyGateHardware(result);
  appendHandrailItems(items, input, result, finishCode, gateHardware.totalGates);

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
}

function buildSd100OrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const finishCode = normaliseFinish(input.finish);
  const isPowdercoat = finishCode === 'PC';
  const discsQuantity = Math.round((result.totalSpigots ?? 0) * 100) / 100;

  if (discsQuantity > 0) {
    const discCode = isPowdercoat ? 'SD100-SS' : `SD100-${finishCode}`;
    pushItem(items, discCode, discsQuantity);
    if (isPowdercoat) {
      pushItem(items, powdercoatChargeCode('PC1-DISC', input.powdercoatColor), discsQuantity);
    }

    const fixing = normaliseFixingType(input.fixingType);
    if (fixing === 'Concrete') {
      pushItem(items, 'TR12-180', discsQuantity);
    } else if (fixing === 'Steel') {
      pushItem(items, 'TR12-50', discsQuantity);
      pushItem(items, 'HN-M12', discsQuantity);
      pushItem(items, 'FW-M1224', discsQuantity);
    } else if (fixing === 'Timber (Bolt Through)') {
      pushItem(items, 'TR12-150', discsQuantity);
      pushItem(items, 'HN-M12', discsQuantity);
      pushItem(items, 'FW-M1224', discsQuantity);
    } else if (fixing === 'Timber (Coach Screw)') {
      pushItem(items, 'LS12-140', discsQuantity);
    }
  }

  const gateHardware = tallyGateHardware(result);
  appendHandrailItems(items, input, result, finishCode, gateHardware.totalGates);

  const extraPackers = typeof input.extraPackers === 'number' ? input.extraPackers : 0;
  if (extraPackers > 0) {
    pushItem(items, 'FG100-08', extraPackers);
  }

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
}

function buildSmartLockTopOrderList(ctx: BuildContext): OrderListItem[] {
  return buildSmartLockOrderList(ctx, SMARTLOCK_BASE_CODES);
}

function buildSmartLockSideOrderList(ctx: BuildContext): OrderListItem[] {
  return buildSmartLockOrderList(ctx, SMARTLOCK_SIDE_CODES);
}

function buildSmartLockOrderList(
  { input, result }: BuildContext,
  codeMap: Record<string, string>,
): OrderListItem[] {
  const items: OrderListItem[] = [];
  const thickness = normaliseThickness(input.glassThickness);
  if (!thickness) return items;
  const code = codeMap[thickness];
  if (!code) return items;
  const qty = kitQuantity(result.totalRun, SMARTLOCK_KIT_LENGTH_MM);
  if (qty <= 0) return items;
  pushItem(items, code, qty);
  return items;
}

function buildLuganoOrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const thickness = normaliseThickness(input.glassThickness);
  if (!thickness) return items;
  const fixing = normaliseFixingType(input.fixingType);
  if (!fixing) return items;
  const codes = LUGANO_KIT_CODES[thickness];
  if (!codes) return items;
  const code = codes[fixing];
  if (!code) return items;
  const qty = kitQuantity(result.totalRun, CHANNEL_KIT_LENGTH_MM);
  if (qty <= 0) return items;
  pushItem(items, code, qty);
  return items;
}

function buildVistaOrderList({ input, result }: BuildContext): OrderListItem[] {
  const items: OrderListItem[] = [];
  const thickness = normaliseThickness(input.glassThickness);
  if (!thickness) return items;
  if (!VISTA_SUPPORTED_THICKNESSES.has(thickness)) return items;
  const fixing = normaliseFixingType(input.fixingType);
  if (!fixing) return items;
  const code = VISTA_KIT_CODES[fixing];
  if (!code) return items;
  const qty = kitQuantity(result.totalRun, CHANNEL_KIT_LENGTH_MM);
  if (qty <= 0) return items;
  pushItem(items, code, qty);
  return items;
}

function appendHandrailItems(
  items: OrderListItem[],
  input: LayoutCalculationInput,
  result: LayoutCalculationResult,
  finishCode: FinishCode,
  gateCount: number,
) {
  const handrail = input.handrail ?? 'none';
  if (!handrail || handrail === 'none') return;

  const isPowdercoat = finishCode === 'PC';
  const runFromLayouts = (result.sidePanelLayouts ?? []).reduce(
    (acc, layout) => acc + (layout?.adjustedLength ?? 0),
    0,
  );
  const effectiveRun = runFromLayouts > 0 ? runFromLayouts : (result.totalRun ?? 0);
  const railQty = effectiveRun > 0 ? Math.ceil(effectiveRun / 5800) : 0;
  const gasketQty = effectiveRun > 0 ? Math.ceil(effectiveRun / 1000) : 0;
  const handrailMeters = effectiveRun > 0 ? Math.round((effectiveRun / 1000) * 10) / 10 : 0;

  if (railQty > 0) {
    pushItem(items, `${handrail}${railSuffix(handrail, finishCode)}`, railQty);
  }

  if (gasketQty > 0) {
    const gasketCode = HANDRAIL_GASKETS[handrail];
    if (gasketCode) pushItem(items, gasketCode, gasketQty);
  }

  const joinerQty = railQty > 0 ? Math.ceil(railQty / 2) : 0;
  if (joinerQty > 0) {
    if (handrail === 'AH40') pushItem(items, 'AHJ180', joinerQty);
    else pushItem(items, `${handrail}J180${joinerSuffix(handrail, finishCode)}`, joinerQty);
  }

  const ninetyCount = cornerCount(input.shape, input.fenceType);
  if (ninetyCount > 0) {
    if (handrail === 'AH40') pushItem(items, 'AHJ90', ninetyCount);
    else pushItem(items, `${handrail}J90${joinerSuffix(handrail, finishCode)}`, ninetyCount);
  }

  if (shouldIncludeWallAttachments(input)) {
    const wallCodes = WALL_ATTACHMENT_CODES[handrail];
    if (wallCodes?.left && wallCodes?.right) {
      pushItem(items, `${wallCodes.left}${wallSuffix(handrail, finishCode)}`, 1);
      pushItem(items, `${wallCodes.right}${wallSuffix(handrail, finishCode)}`, 1);
    } else if (wallCodes?.pair) {
      pushItem(items, `${wallCodes.pair}${wallSuffix(handrail, finishCode)}`, 2);
    }
  }

  if (gateCount > 0) {
    const endcap = endcapCode(handrail, finishCode);
    if (endcap) pushItem(items, endcap, gateCount * 2);
    if (isPowdercoat) {
      pushItem(items, powdercoatChargeCode('PC-ENDCAP', input.powdercoatColor), gateCount * 2);
    }
  }

  if (isPowdercoat) {
    let bracketQty = 0;
    if (handrail !== 'AH40') {
      bracketQty += joinerQty;
      bracketQty += ninetyCount;
    }
    if (shouldIncludeWallAttachments(input)) {
      if (handrail === 'S25' || handrail === 'S40' || handrail === 'R40') bracketQty += 2;
      else if (handrail === 'AH40') bracketQty += 2;
    }
    if (bracketQty > 0) {
      pushItem(items, powdercoatChargeCode('PC-BRACKET', input.powdercoatColor), bracketQty);
    }
    if (handrailMeters > 0) {
      pushItem(items, powdercoatChargeCode('PC-PERM', input.powdercoatColor), handrailMeters);
    }
  }
}

function powdercoatFinishSuffix(color?: string | null): string {
  if (!color) return 'PC';
  return `PC-${color.replace(/\s+/g, '')}`;
}

function powdercoatChargeCode(base: string, color?: string | null): string {
  if (!color) return base;
  const trimmed = color.trim();
  if (!trimmed) return base;
  return `${base} (${trimmed})`;
}

function pushItem(items: OrderListItem[], code: string, quantity: number) {
  const qty = Number(quantity);
  if (!code || Number.isNaN(qty) || qty <= 0) return;
  const roundedQty = Math.round(qty * 100) / 100;
  const existing = items.find((item) => item.code === code);
  if (existing) {
    existing.quantity = Math.round((existing.quantity + roundedQty) * 100) / 100;
  } else {
    items.push({ code, description: describe(code), quantity: roundedQty });
  }
}

function describe(code: string): string {
  const base = normaliseCodeForDescription(code);
  return BASE_DESCRIPTIONS[base] ?? base;
}

function normaliseCodeForDescription(code: string): string {
  return code
    .replace(FINISH_SUFFIX_PATTERN, '')
    .replace(POWDERCOAT_SUFFIX_PATTERN, '')
    .replace(/\s*\(.*\)$/, '');
}

function normaliseFinish(raw?: string | null): FinishCode {
  if (!raw) return 'SS';
  const key = raw.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
  return FINISH_CODE_MAP[key] ?? 'SS';
}

function normaliseThickness(raw?: string | null): string | null {
  if (!raw) return null;
  return raw.toString().replace(/mm$/i, '').replace(/\s+/g, '').trim();
}

function normaliseFixingType(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.toString().trim();
  const key = trimmed.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.includes('concrete')) return 'Concrete';
  if (key.includes('steel')) return 'Steel';
  if (key.includes('bolt') && key.includes('timber')) return 'Timber (Bolt Through)';
  if (key.includes('lag') || key.includes('coach') || key.includes('screw')) return 'Timber (Coach Screw)';
  return trimmed;
}

function resolvePf150FixKit(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.toString().trim();
  if (!trimmed) return null;
  if (PF150_FIX_KITS[trimmed]) return PF150_FIX_KITS[trimmed];
  const match = Object.entries(PF150_FIX_KITS).find(([label]) => label.toLowerCase() === trimmed.toLowerCase());
  return match ? match[1] : null;
}

function kitQuantity(totalRunMm: number | null | undefined, kitLengthMm: number): number {
  const run = typeof totalRunMm === 'number' ? totalRunMm : Number(totalRunMm ?? 0);
  if (!Number.isFinite(run) || run <= 0) return 0;
  return Math.max(1, Math.ceil(run / kitLengthMm));
}

function railSuffix(handrail: string, finish: FinishCode): string {
  if (handrail === 'AH40') {
    if (finish === 'BK') return '-BK';
    if (finish === 'PC') return '-MILL';
    return '-SS';
  }
  if (finish === 'PC') return '-SS';
  return `-${finish}`;
}

function joinerSuffix(handrail: string, finish: FinishCode): string {
  if (handrail === 'AH40') return '';
  if (finish === 'PC') return '-SS';
  return `-${finish}`;
}

function wallSuffix(handrail: string, finish: FinishCode): string {
  if (handrail === 'AH40') {
    return finish === 'BK' ? '-BK' : '-SS';
  }
  if (finish === 'PC') return '-SS';
  return `-${finish}`;
}

function endcapCode(handrail: string, finish: FinishCode): string | null {
  if (handrail === 'AH40') {
    return finish === 'BK' ? 'AHEC-BK' : 'AHEC-SS';
  }
  if (handrail === 'S25' || handrail === 'S40' || handrail === 'R40') {
    const suffix = finish === 'PC' ? '-SS' : `-${finish}`;
    return `${handrail}EC${suffix}`;
  }
  return null;
}

function cornerCount(shape: string | null, fenceType?: string): number {
  switch (shape) {
    case 'corner':
      return 1;
    case 'u':
      return 2;
    case 'enclosed':
      return fenceType && fenceType !== 'balustrade' ? 0 : 4;
    default:
      return 0;
  }
}

function shouldIncludeWallAttachments(input: LayoutCalculationInput): boolean {
  if (input.shape === 'enclosed' && input.fenceType && input.fenceType !== 'balustrade') {
    return false;
  }
  return true;
}

type GateHardwareTally = {
  totalGates: number;
  hingeGlass: number;
  hingeWall: number;
  latchGlass: number;
  latchWall: number;
};

function tallyGateHardware(result: LayoutCalculationResult): GateHardwareTally {
  const gates = result.sideGatesRender ?? [];
  const layouts = result.sidePanelLayouts ?? [];
  let totalGates = 0;
  let hingeGlass = 0;
  let hingeWall = 0;
  let latchGlass = 0;
  let latchWall = 0;

  gates.forEach((gate, index) => {
    if (!gate || !gate.enabled) return;
    totalGates += 1;
    const layout = layouts[index];
    const panelCount = layout?.panelWidths?.length ?? 0;
    const rawIndex = typeof gate.panelIndex === 'number' ? gate.panelIndex : 0;
    const gateIndex = Math.max(0, Math.min(panelCount, rawIndex));
    const hingeOnLeft = !!gate.hingeOnLeft;
    const hasLeftPanel = gateIndex > 0;
    const hasRightPanel = gateIndex < panelCount;
    const hingeToGlass = hingeOnLeft ? hasLeftPanel : hasRightPanel;
    const latchToGlass = hingeOnLeft ? hasRightPanel : hasLeftPanel;

    if (hingeToGlass) hingeGlass += 1;
    else hingeWall += 1;

    if (latchToGlass) latchGlass += 1;
    else latchWall += 1;
  });

  return { totalGates, hingeGlass, hingeWall, latchGlass, latchWall };
}
