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

const BASE_DESCRIPTIONS: Record<string, string> = {
  SP12: 'SP12 Side Fix Post',
  'SP12FK-1': 'SP12 Concrete Fixing Kit',
  'SP12FK-2': 'SP12 Steel Fixing Kit',
  'SP12FK-3': 'SP12 Timber Fixing Kit (Coach Screw)',
  'SP12FK-4': 'SP12 Timber Fixing Kit (Through Bolt)',
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
  ASC180: 'Glass-to-Glass Gate Hinge (ASC180)',
  ASC90: 'Wall-to-Glass Gate Hinge (ASC90)',
  PL180GG: 'Glass-to-Glass Gate Latch (PL180GG)',
  PL090WG: 'Glass-to-Wall Gate Latch (PL090WG)',
};

const FINISH_SUFFIX_PATTERN = /-(SS|PS|BK|MILL)$/i;

const BUILDERS: Partial<Record<CalcKey, (ctx: BuildContext) => OrderListItem[]>> = {
  sp12: buildSp12OrderList,
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
  const isPowdercoat = finishCode === 'PC';
  const postSuffix = finishCode === 'PC' ? 'SS' : finishCode;
  pushItem(items, `SP12-${postSuffix}`, totalSpigots);

  const fixingCode = input.fixingType ? SP12_FIXING_KITS[input.fixingType] : undefined;
  if (fixingCode) {
    pushItem(items, fixingCode, totalSpigots);
  }

  const gateHardware = tallyGateHardware(result);
  const gateCount = gateHardware.totalGates;

  const handrail = input.handrail ?? 'none';
  if (handrail && handrail !== 'none') {
    const runFromLayouts = (result.sidePanelLayouts ?? []).reduce((acc, layout) => acc + (layout?.adjustedLength ?? 0), 0);
    const effectiveRun = runFromLayouts > 0 ? runFromLayouts : result.totalRun;
    const railQty = Math.max(0, Math.ceil(effectiveRun / 5800));
    const gasketQty = Math.max(0, Math.ceil(effectiveRun / 1000));
    const handrailMeters = Math.max(0, Math.round((effectiveRun / 1000) * 10) / 10);

    if (railQty > 0) {
      pushItem(items, `${handrail}${railSuffix(handrail, finishCode)}`, railQty);
    }

    if (gasketQty > 0) {
      const gasketCode = HANDRAIL_GASKETS[handrail];
      if (gasketCode) pushItem(items, gasketCode, gasketQty);
    }

    const joinerQty = Math.max(0, Math.ceil(railQty / 2));
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
      if (isPowdercoat) pushItem(items, 'PC-ENDCAP', gateCount * 2);
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
      if (bracketQty > 0) pushItem(items, 'PC-BRACKET', bracketQty);
      if (handrailMeters > 0) pushItem(items, 'PC-PERM', handrailMeters);
    }
  }

  if (gateHardware.hingeGlass > 0) pushItem(items, 'ASC180', gateHardware.hingeGlass);
  if (gateHardware.hingeWall > 0) pushItem(items, 'ASC90', gateHardware.hingeWall);
  if (gateHardware.latchGlass > 0) pushItem(items, 'PL180GG', gateHardware.latchGlass);
  if (gateHardware.latchWall > 0) pushItem(items, 'PL090WG', gateHardware.latchWall);

  return items;
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
  return code.replace(FINISH_SUFFIX_PATTERN, '');
}

function normaliseFinish(raw?: string | null): FinishCode {
  if (!raw) return 'SS';
  const key = raw.replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
  return FINISH_CODE_MAP[key] ?? 'SS';
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
