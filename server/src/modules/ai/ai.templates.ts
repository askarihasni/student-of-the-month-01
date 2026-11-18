export interface DesignNodeData {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
  locked?: boolean;
  opacity?: number;
  rotation?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  clipContent?: boolean;
  childrenIds?: string[];
  parentId?: string | null;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface GeneratedDesignResult {
  title: string;
  explanation: string;
  suggestedPrompts: string[];
  nodes: DesignNodeData[];
}

function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

export function generateTemplateDesign(
  prompt: string,
  baseX: number = 100,
  baseY: number = 100
): GeneratedDesignResult {
  const p = prompt.toLowerCase();

  // 0A. COLOR SELECTOR SWATCHES
  if (p.includes('color') || p.includes('swatch') || p.includes('selector')) {
    const frameId = genId('frame_swatches');
    const titleId = genId('text_title');
    const subId = genId('text_sub');
    const sw1 = genId('ellipse_sw1');
    const sw2 = genId('ellipse_sw2');
    const sw3 = genId('ellipse_sw3');
    const sw4 = genId('ellipse_sw4');
    const sw5 = genId('ellipse_sw5');
    const ringId = genId('ellipse_ring');
    const labelId = genId('text_lbl');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Color Selector Swatches',
        x: baseX,
        y: baseY,
        width: 320,
        height: 140,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 16,
        clipContent: true,
        childrenIds: [titleId, subId, ringId, sw1, sw2, sw3, sw4, sw5, labelId],
      },
      {
        id: titleId,
        type: 'text',
        name: 'Section Title',
        x: baseX + 20,
        y: baseY + 18,
        width: 200,
        height: 18,
        text: 'AVAILABLE COLORS',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#94A3B8',
        parentId: frameId,
      },
      {
        id: subId,
        type: 'text',
        name: 'Selected Name',
        x: baseX + 190,
        y: baseY + 18,
        width: 110,
        height: 18,
        text: 'Figma Blue',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'right',
        fill: '#0D99FF',
        parentId: frameId,
      },
      {
        id: ringId,
        type: 'ellipse',
        name: 'Active Ring',
        x: baseX + 72,
        y: baseY + 48,
        width: 36,
        height: 36,
        fill: 'transparent',
        stroke: '#0D99FF',
        strokeWidth: 2,
        parentId: frameId,
      },
      {
        id: sw1,
        type: 'ellipse',
        name: 'Color: Midnight',
        x: baseX + 24,
        y: baseY + 52,
        width: 28,
        height: 28,
        fill: '#0F172A',
        stroke: '#475569',
        strokeWidth: 1,
        parentId: frameId,
      },
      {
        id: sw2,
        type: 'ellipse',
        name: 'Color: Figma Blue',
        x: baseX + 76,
        y: baseY + 52,
        width: 28,
        height: 28,
        fill: '#0D99FF',
        parentId: frameId,
      },
      {
        id: sw3,
        type: 'ellipse',
        name: 'Color: Emerald',
        x: baseX + 128,
        y: baseY + 52,
        width: 28,
        height: 28,
        fill: '#10B981',
        parentId: frameId,
      },
      {
        id: sw4,
        type: 'ellipse',
        name: 'Color: Amber',
        x: baseX + 180,
        y: baseY + 52,
        width: 28,
        height: 28,
        fill: '#F59E0B',
        parentId: frameId,
      },
      {
        id: sw5,
        type: 'ellipse',
        name: 'Color: Coral',
        x: baseX + 232,
        y: baseY + 52,
        width: 28,
        height: 28,
        fill: '#EF4444',
        parentId: frameId,
      },
      {
        id: labelId,
        type: 'text',
        name: 'Hint Text',
        x: baseX + 20,
        y: baseY + 102,
        width: 280,
        height: 18,
        text: '5 color options in stock with fast delivery',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#64748B',
        parentId: frameId,
      },
    ];

    return {
      title: 'Color Selector Swatches',
      explanation: 'Interactive color picker row with 5 stylish circular color swatches, active selection ring, and product availability label.',
      suggestedPrompts: [
        'Add a Size selector (S, M, L, XL) underneath',
        'Add Quantity counter stepper',
      ],
      nodes,
    };
  }

  // 0B. WISHLIST / HEART ICON
  if (p.includes('wishlist') || p.includes('heart') || p.includes('favorite') || p.includes('like')) {
    const frameId = genId('frame_wishlist');
    const heartCircle = genId('ellipse_heart');
    const heartIcon = genId('text_heart');
    const titleId = genId('text_title');
    const descId = genId('text_desc');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Wishlist Action Card',
        x: baseX,
        y: baseY,
        width: 260,
        height: 110,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 16,
        clipContent: true,
        childrenIds: [heartCircle, heartIcon, titleId, descId],
      },
      {
        id: heartCircle,
        type: 'ellipse',
        name: 'Heart Circle Button',
        x: baseX + 20,
        y: baseY + 28,
        width: 48,
        height: 48,
        fill: '#451A24',
        stroke: '#F43F5E',
        strokeWidth: 1.5,
        parentId: frameId,
      },
      {
        id: heartIcon,
        type: 'text',
        name: 'Heart Symbol',
        x: baseX + 20,
        y: baseY + 36,
        width: 48,
        height: 32,
        text: '♥',
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#F43F5E',
        parentId: frameId,
      },
      {
        id: titleId,
        type: 'text',
        name: 'Action Title',
        x: baseX + 80,
        y: baseY + 30,
        width: 160,
        height: 22,
        text: 'Saved to Wishlist',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: descId,
        type: 'text',
        name: 'Save Count',
        x: baseX + 80,
        y: baseY + 54,
        width: 160,
        height: 18,
        text: '342 people saved this item',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#94A3B8',
        parentId: frameId,
      },
    ];

    return {
      title: 'Wishlist Heart Badge',
      explanation: 'Sleek favorite/wishlist component with crimson heart icon circle, confirmation title, and social proof counter.',
      suggestedPrompts: [
        'Add Share button next to Wishlist',
        'Turn into an interactive product floating action bar',
      ],
      nodes,
    };
  }

  // 1. LOGIN / SIGN IN / AUTH SCREEN
  if (p.includes('login') || p.includes('sign in') || p.includes('signin') || p.includes('auth')) {
    const frameId = genId('frame_login');
    const bgCardId = genId('rect_card');
    const logoId = genId('ellipse_logo');
    const titleId = genId('text_title');
    const subtitleId = genId('text_sub');
    const emailLabelId = genId('text_email_lbl');
    const emailInputId = genId('rect_email');
    const emailValId = genId('text_email_val');
    const passLabelId = genId('text_pass_lbl');
    const passInputId = genId('rect_pass');
    const passValId = genId('text_pass_val');
    const btnId = genId('rect_btn');
    const btnTextId = genId('text_btn');
    const footerId = genId('text_footer');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Login Screen (iPhone)',
        x: baseX,
        y: baseY,
        width: 375,
        height: 640,
        fill: '#121212',
        cornerRadius: 24,
        clipContent: true,
        childrenIds: [
          bgCardId,
          logoId,
          titleId,
          subtitleId,
          emailLabelId,
          emailInputId,
          emailValId,
          passLabelId,
          passInputId,
          passValId,
          btnId,
          btnTextId,
          footerId,
        ],
      },
      // Logo icon circle
      {
        id: logoId,
        type: 'ellipse',
        name: 'Brand Logo',
        x: baseX + 155,
        y: baseY + 50,
        width: 64,
        height: 64,
        fill: '#0D99FF',
        parentId: frameId,
      },
      // Welcome Title
      {
        id: titleId,
        type: 'text',
        name: 'Title Text',
        x: baseX + 30,
        y: baseY + 130,
        width: 315,
        height: 36,
        text: 'Welcome back',
        fontSize: 26,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      // Subtitle
      {
        id: subtitleId,
        type: 'text',
        name: 'Subtitle Text',
        x: baseX + 30,
        y: baseY + 172,
        width: 315,
        height: 24,
        text: 'Please enter your account details to sign in',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'center',
        fill: '#94A3B8',
        parentId: frameId,
      },
      // Email Label
      {
        id: emailLabelId,
        type: 'text',
        name: 'Email Label',
        x: baseX + 32,
        y: baseY + 225,
        width: 310,
        height: 18,
        text: 'EMAIL ADDRESS',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'left',
        fill: '#94A3B8',
        parentId: frameId,
      },
      // Email Input Field
      {
        id: emailInputId,
        type: 'rectangle',
        name: 'Email Input Container',
        x: baseX + 30,
        y: baseY + 248,
        width: 315,
        height: 48,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: emailValId,
        type: 'text',
        name: 'Email Placeholder',
        x: baseX + 45,
        y: baseY + 263,
        width: 280,
        height: 20,
        text: 'alex.designer@vectorly.io',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      // Password Label
      {
        id: passLabelId,
        type: 'text',
        name: 'Password Label',
        x: baseX + 32,
        y: baseY + 315,
        width: 310,
        height: 18,
        text: 'PASSWORD',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'left',
        fill: '#94A3B8',
        parentId: frameId,
      },
      // Password Input Field
      {
        id: passInputId,
        type: 'rectangle',
        name: 'Password Input Container',
        x: baseX + 30,
        y: baseY + 338,
        width: 315,
        height: 48,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: passValId,
        type: 'text',
        name: 'Password Dots',
        x: baseX + 45,
        y: baseY + 353,
        width: 280,
        height: 20,
        text: '••••••••••••',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        fill: '#94A3B8',
        parentId: frameId,
      },
      // Sign In Action Button
      {
        id: btnId,
        type: 'rectangle',
        name: 'Sign In Button',
        x: baseX + 30,
        y: baseY + 420,
        width: 315,
        height: 48,
        fill: '#0D99FF',
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: btnTextId,
        type: 'text',
        name: 'Sign In Text',
        x: baseX + 30,
        y: baseY + 434,
        width: 315,
        height: 22,
        text: 'Sign In to Workspace',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      // Footer text
      {
        id: footerId,
        type: 'text',
        name: 'Footer Link',
        x: baseX + 30,
        y: baseY + 500,
        width: 315,
        height: 20,
        text: "Don't have an account? Create one for free",
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'center',
        fill: '#94A3B8',
        parentId: frameId,
      },
    ];

    return {
      title: 'Mobile Login Screen',
      explanation: 'A modern dark-mode mobile authentication screen with logo icon, email & password inputs, vibrant primary action button, and sign up footer.',
      suggestedPrompts: [
        'Add a Social Sign In button (Google/Apple)',
        'Change theme to Light Mode with Indigo accents',
        'Add a Forgot Password link row',
      ],
      nodes,
    };
  }

  // 2. DASHBOARD / ANALYTICS CARD
  if (p.includes('dashboard') || p.includes('analytics') || p.includes('stats') || p.includes('metric') || p.includes('revenue')) {
    const frameId = genId('frame_analytics');
    const badgeId = genId('rect_badge');
    const badgeTextId = genId('text_badge');
    const titleId = genId('text_title');
    const amountId = genId('text_amount');
    const chartBar1 = genId('rect_bar1');
    const chartBar2 = genId('rect_bar2');
    const chartBar3 = genId('rect_bar3');
    const chartBar4 = genId('rect_bar4');
    const chartBar5 = genId('rect_bar5');
    const subtextId = genId('text_sub');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Analytics Card',
        x: baseX,
        y: baseY,
        width: 380,
        height: 260,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 16,
        clipContent: true,
        childrenIds: [
          titleId,
          amountId,
          badgeId,
          badgeTextId,
          chartBar1,
          chartBar2,
          chartBar3,
          chartBar4,
          chartBar5,
          subtextId,
        ],
      },
      {
        id: titleId,
        type: 'text',
        name: 'Metric Title',
        x: baseX + 24,
        y: baseY + 24,
        width: 200,
        height: 20,
        text: 'Total Revenue (Q4)',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#94A3B8',
        parentId: frameId,
      },
      {
        id: badgeId,
        type: 'rectangle',
        name: 'Growth Badge',
        x: baseX + 280,
        y: baseY + 22,
        width: 74,
        height: 24,
        fill: '#064E3B',
        cornerRadius: 12,
        parentId: frameId,
      },
      {
        id: badgeTextId,
        type: 'text',
        name: 'Growth Text',
        x: baseX + 280,
        y: baseY + 26,
        width: 74,
        height: 18,
        text: '+28.4%',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#10B981',
        parentId: frameId,
      },
      {
        id: amountId,
        type: 'text',
        name: 'Amount Big',
        x: baseX + 24,
        y: baseY + 54,
        width: 250,
        height: 44,
        text: '$124,590.00',
        fontSize: 32,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      // Trend Bar Chart Visualization
      {
        id: chartBar1,
        type: 'rectangle',
        name: 'Chart Bar 1',
        x: baseX + 24,
        y: baseY + 140,
        width: 48,
        height: 60,
        fill: '#334155',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: chartBar2,
        type: 'rectangle',
        name: 'Chart Bar 2',
        x: baseX + 84,
        y: baseY + 120,
        width: 48,
        height: 80,
        fill: '#334155',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: chartBar3,
        type: 'rectangle',
        name: 'Chart Bar 3',
        x: baseX + 144,
        y: baseY + 100,
        width: 48,
        height: 100,
        fill: '#0D99FF',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: chartBar4,
        type: 'rectangle',
        name: 'Chart Bar 4',
        x: baseX + 204,
        y: baseY + 130,
        width: 48,
        height: 70,
        fill: '#334155',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: chartBar5,
        type: 'rectangle',
        name: 'Chart Bar 5',
        x: baseX + 264,
        y: baseY + 80,
        width: 48,
        height: 120,
        fill: '#10B981',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: subtextId,
        type: 'text',
        name: 'Comparison Subtext',
        x: baseX + 24,
        y: baseY + 218,
        width: 320,
        height: 18,
        text: 'Compared to previous month ($97,010.00)',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#64748B',
        parentId: frameId,
      },
    ];

    return {
      title: 'Analytics Revenue Card',
      explanation: 'A high-converting SaaS revenue KPI card featuring bold metrics, positive growth pill badge, and 5-stage comparative bar chart.',
      suggestedPrompts: [
        'Add a secondary Conversion Rate card',
        'Add month labels under each bar',
        'Turn this into a full 3-card analytics dashboard row',
      ],
      nodes,
    };
  }

  // 3. PRICING CARD
  if (p.includes('pricing') || p.includes('plan') || p.includes('tier') || p.includes('subscription')) {
    const frameId = genId('frame_pricing');
    const badgeId = genId('rect_badge');
    const badgeTextId = genId('text_badge');
    const titleId = genId('text_title');
    const descId = genId('text_desc');
    const priceId = genId('text_price');
    const periodId = genId('text_period');
    const f1Id = genId('text_f1');
    const f2Id = genId('text_f2');
    const f3Id = genId('text_f3');
    const f4Id = genId('text_f4');
    const btnId = genId('rect_btn');
    const btnTextId = genId('text_btn');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Pricing Card (Pro)',
        x: baseX,
        y: baseY,
        width: 340,
        height: 480,
        fill: '#1E1E1E',
        stroke: '#0D99FF',
        strokeWidth: 2,
        cornerRadius: 20,
        clipContent: true,
        childrenIds: [
          badgeId,
          badgeTextId,
          titleId,
          descId,
          priceId,
          periodId,
          f1Id,
          f2Id,
          f3Id,
          f4Id,
          btnId,
          btnTextId,
        ],
      },
      {
        id: badgeId,
        type: 'rectangle',
        name: 'Popular Badge',
        x: baseX + 215,
        y: baseY + 24,
        width: 95,
        height: 24,
        fill: '#0D99FF',
        cornerRadius: 12,
        parentId: frameId,
      },
      {
        id: badgeTextId,
        type: 'text',
        name: 'Popular Badge Text',
        x: baseX + 215,
        y: baseY + 28,
        width: 95,
        height: 16,
        text: 'MOST POPULAR',
        fontSize: 9,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: titleId,
        type: 'text',
        name: 'Plan Title',
        x: baseX + 28,
        y: baseY + 26,
        width: 170,
        height: 28,
        text: 'Professional',
        fontSize: 22,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: descId,
        type: 'text',
        name: 'Plan Description',
        x: baseX + 28,
        y: baseY + 58,
        width: 280,
        height: 20,
        text: 'Best for growing design teams & studios',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#94A3B8',
        parentId: frameId,
      },
      {
        id: priceId,
        type: 'text',
        name: 'Price Figure',
        x: baseX + 28,
        y: baseY + 95,
        width: 120,
        height: 48,
        text: '$29',
        fontSize: 42,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: periodId,
        type: 'text',
        name: 'Per Month',
        x: baseX + 130,
        y: baseY + 120,
        width: 100,
        height: 20,
        text: '/ user / month',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#64748B',
        parentId: frameId,
      },
      // Features list
      {
        id: f1Id,
        type: 'text',
        name: 'Feature 1',
        x: baseX + 28,
        y: baseY + 175,
        width: 280,
        height: 24,
        text: '✓  Unlimited vector canvas files',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      {
        id: f2Id,
        type: 'text',
        name: 'Feature 2',
        x: baseX + 28,
        y: baseY + 215,
        width: 280,
        height: 24,
        text: '✓  Real-time team collaboration',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      {
        id: f3Id,
        type: 'text',
        name: 'Feature 3',
        x: baseX + 28,
        y: baseY + 255,
        width: 280,
        height: 24,
        text: '✓  Advanced SVG, PDF & PNG export',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      {
        id: f4Id,
        type: 'text',
        name: 'Feature 4',
        x: baseX + 28,
        y: baseY + 295,
        width: 280,
        height: 24,
        text: '✓  Gemini AI Design Agent included',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#0D99FF',
        parentId: frameId,
      },
      // CTA Button
      {
        id: btnId,
        type: 'rectangle',
        name: 'Get Started Button',
        x: baseX + 28,
        y: baseY + 360,
        width: 284,
        height: 48,
        fill: '#0D99FF',
        cornerRadius: 12,
        parentId: frameId,
      },
      {
        id: btnTextId,
        type: 'text',
        name: 'Button Label',
        x: baseX + 28,
        y: baseY + 375,
        width: 284,
        height: 20,
        text: 'Start 14-Day Free Trial',
        fontSize: 14,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
    ];

    return {
      title: 'Pro Pricing Tier Card',
      explanation: 'A sleek SaaS tier pricing card with prominent badge, billing period breakdown, checkmark feature list, and bold call-to-action button.',
      suggestedPrompts: [
        'Generate a 3-tier pricing comparison (Starter, Pro, Enterprise)',
        'Add an Annual / Monthly billing toggle pill',
      ],
      nodes,
    };
  }

  // 4. E-COMMERCE PRODUCT CARD
  if (p.includes('product') || p.includes('shop') || p.includes('cart') || p.includes('ecommerce') || p.includes('item')) {
    const frameId = genId('frame_product');
    const imgPlaceholderId = genId('rect_image');
    const badgeId = genId('rect_badge');
    const badgeTextId = genId('text_badge');
    const titleId = genId('text_title');
    const priceId = genId('text_price');
    const ratingId = genId('text_rating');
    const btnId = genId('rect_btn');
    const btnTextId = genId('text_btn');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Product Card',
        x: baseX,
        y: baseY,
        width: 300,
        height: 420,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 16,
        clipContent: true,
        childrenIds: [
          imgPlaceholderId,
          badgeId,
          badgeTextId,
          titleId,
          priceId,
          ratingId,
          btnId,
          btnTextId,
        ],
      },
      {
        id: imgPlaceholderId,
        type: 'rectangle',
        name: 'Product Image Placeholder',
        x: baseX + 16,
        y: baseY + 16,
        width: 268,
        height: 190,
        fill: '#2C2C2C',
        cornerRadius: 12,
        parentId: frameId,
      },
      {
        id: badgeId,
        type: 'rectangle',
        name: 'Sale Badge',
        x: baseX + 28,
        y: baseY + 28,
        width: 55,
        height: 22,
        fill: '#EF4444',
        cornerRadius: 6,
        parentId: frameId,
      },
      {
        id: badgeTextId,
        type: 'text',
        name: 'Sale Text',
        x: baseX + 28,
        y: baseY + 32,
        width: 55,
        height: 16,
        text: '-25% OFF',
        fontSize: 9,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: ratingId,
        type: 'text',
        name: 'Rating Stars',
        x: baseX + 20,
        y: baseY + 220,
        width: 260,
        height: 18,
        text: '★★★★★ (128 reviews)',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        fill: '#F59E0B',
        parentId: frameId,
      },
      {
        id: titleId,
        type: 'text',
        name: 'Product Title',
        x: baseX + 20,
        y: baseY + 245,
        width: 260,
        height: 24,
        text: 'Minimal Studio Headphones',
        fontSize: 16,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: priceId,
        type: 'text',
        name: 'Price Tag',
        x: baseX + 20,
        y: baseY + 280,
        width: 260,
        height: 28,
        text: '$149.00  $199.00',
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        fill: '#10B981',
        parentId: frameId,
      },
      {
        id: btnId,
        type: 'rectangle',
        name: 'Add to Cart Button',
        x: baseX + 16,
        y: baseY + 345,
        width: 268,
        height: 44,
        fill: '#0D99FF',
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: btnTextId,
        type: 'text',
        name: 'Add to Cart Text',
        x: baseX + 16,
        y: baseY + 358,
        width: 268,
        height: 18,
        text: 'Add to Cart',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
    ];

    return {
      title: 'E-commerce Product Card',
      explanation: 'Modern e-commerce item card with image slot, discount badge, star rating, strike-through discount pricing, and quick Add to Cart button.',
      suggestedPrompts: [
        'Add color selector swatches under the title',
        'Add wishlist heart icon in top corner',
      ],
      nodes,
    };
  }

  // 5. USER PROFILE CARD
  if (p.includes('profile') || p.includes('user') || p.includes('avatar') || p.includes('author')) {
    const frameId = genId('frame_profile');
    const bannerId = genId('rect_banner');
    const avatarId = genId('ellipse_avatar');
    const nameId = genId('text_name');
    const handleId = genId('text_handle');
    const bioId = genId('text_bio');
    const stat1Id = genId('text_stat1');
    const stat2Id = genId('text_stat2');
    const btnFollowId = genId('rect_follow');
    const btnFollowTextId = genId('text_follow');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'User Profile Card',
        x: baseX,
        y: baseY,
        width: 320,
        height: 380,
        fill: '#1E1E1E',
        stroke: '#383838',
        strokeWidth: 1,
        cornerRadius: 20,
        clipContent: true,
        childrenIds: [
          bannerId,
          avatarId,
          nameId,
          handleId,
          bioId,
          stat1Id,
          stat2Id,
          btnFollowId,
          btnFollowTextId,
        ],
      },
      {
        id: bannerId,
        type: 'rectangle',
        name: 'Cover Banner',
        x: baseX,
        y: baseY,
        width: 320,
        height: 110,
        fill: '#0D99FF',
        parentId: frameId,
      },
      {
        id: avatarId,
        type: 'ellipse',
        name: 'Profile Photo',
        x: baseX + 124,
        y: baseY + 70,
        width: 72,
        height: 72,
        fill: '#F1F5F9',
        stroke: '#1E1E1E',
        strokeWidth: 4,
        parentId: frameId,
      },
      {
        id: nameId,
        type: 'text',
        name: 'User Full Name',
        x: baseX + 20,
        y: baseY + 155,
        width: 280,
        height: 24,
        text: 'Askari Hasni',
        fontSize: 18,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: handleId,
        type: 'text',
        name: 'Username Handle',
        x: baseX + 20,
        y: baseY + 182,
        width: 280,
        height: 18,
        text: '@askari.designer',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'center',
        fill: '#0D99FF',
        parentId: frameId,
      },
      {
        id: bioId,
        type: 'text',
        name: 'Bio Description',
        x: baseX + 25,
        y: baseY + 212,
        width: 270,
        height: 36,
        text: 'Product Designer & Full-Stack Engineer creating intuitive digital experiences.',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'center',
        fill: '#94A3B8',
        parentId: frameId,
      },
      {
        id: stat1Id,
        type: 'text',
        name: 'Followers Stat',
        x: baseX + 40,
        y: baseY + 260,
        width: 100,
        height: 20,
        text: '14.2K Followers',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      {
        id: stat2Id,
        type: 'text',
        name: 'Projects Stat',
        x: baseX + 180,
        y: baseY + 260,
        width: 100,
        height: 20,
        text: '86 Projects',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#E2E8F0',
        parentId: frameId,
      },
      {
        id: btnFollowId,
        type: 'rectangle',
        name: 'Follow Button',
        x: baseX + 35,
        y: baseY + 305,
        width: 250,
        height: 42,
        fill: '#0D99FF',
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: btnFollowTextId,
        type: 'text',
        name: 'Follow Text',
        x: baseX + 35,
        y: baseY + 318,
        width: 250,
        height: 18,
        text: 'Follow Profile',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
    ];

    return {
      title: 'User Profile Card',
      explanation: 'Clean user profile card with colorful header banner, circular avatar container, bio copy, follower metrics, and primary follow button.',
      suggestedPrompts: [
        'Add a Message button next to Follow',
        'Add social media icon badges',
      ],
      nodes,
    };
  }

  // 6. HERO BANNER / LANDING SECTION
  if (p.includes('hero') || p.includes('landing') || p.includes('header') || p.includes('banner')) {
    const frameId = genId('frame_hero');
    const badgeId = genId('rect_badge');
    const badgeTextId = genId('text_badge');
    const titleId = genId('text_title');
    const subId = genId('text_sub');
    const btn1Id = genId('rect_btn1');
    const btn1TextId = genId('text_btn1');
    const btn2Id = genId('rect_btn2');
    const btn2TextId = genId('text_btn2');

    const nodes: DesignNodeData[] = [
      {
        id: frameId,
        type: 'frame',
        name: 'Hero Section',
        x: baseX,
        y: baseY,
        width: 800,
        height: 380,
        fill: '#0F172A',
        stroke: '#334155',
        strokeWidth: 1,
        cornerRadius: 24,
        clipContent: true,
        childrenIds: [
          badgeId,
          badgeTextId,
          titleId,
          subId,
          btn1Id,
          btn1TextId,
          btn2Id,
          btn2TextId,
        ],
      },
      {
        id: badgeId,
        type: 'rectangle',
        name: 'Pill Announcement',
        x: baseX + 300,
        y: baseY + 45,
        width: 200,
        height: 28,
        fill: '#1E293B',
        stroke: '#0D99FF',
        strokeWidth: 1,
        cornerRadius: 14,
        parentId: frameId,
      },
      {
        id: badgeTextId,
        type: 'text',
        name: 'Announcement Text',
        x: baseX + 300,
        y: baseY + 51,
        width: 200,
        height: 18,
        text: '✨ Powered by Gemini 3.8 Flash',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#0D99FF',
        parentId: frameId,
      },
      {
        id: titleId,
        type: 'text',
        name: 'Main Headline',
        x: baseX + 50,
        y: baseY + 95,
        width: 700,
        height: 64,
        text: 'Design Vectors Faster with AI Intelligence',
        fontSize: 34,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      {
        id: subId,
        type: 'text',
        name: 'Subtitle Copy',
        x: baseX + 100,
        y: baseY + 175,
        width: 600,
        height: 48,
        text: 'Transform plain words into professional vector designs instantly. Full canvas editing, instant real-time sync, and team collaboration.',
        fontSize: 15,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'normal',
        textAlign: 'center',
        fill: '#94A3B8',
        parentId: frameId,
      },
      // Primary Action
      {
        id: btn1Id,
        type: 'rectangle',
        name: 'Primary CTA Button',
        x: baseX + 250,
        y: baseY + 255,
        width: 140,
        height: 48,
        fill: '#0D99FF',
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: btn1TextId,
        type: 'text',
        name: 'Primary CTA Text',
        x: baseX + 250,
        y: baseY + 269,
        width: 140,
        height: 20,
        text: 'Get Started Free',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#FFFFFF',
        parentId: frameId,
      },
      // Secondary Action
      {
        id: btn2Id,
        type: 'rectangle',
        name: 'Secondary CTA Button',
        x: baseX + 410,
        y: baseY + 255,
        width: 140,
        height: 48,
        fill: '#1E293B',
        stroke: '#475569',
        strokeWidth: 1,
        cornerRadius: 10,
        parentId: frameId,
      },
      {
        id: btn2TextId,
        type: 'text',
        name: 'Secondary CTA Text',
        x: baseX + 410,
        y: baseY + 269,
        width: 140,
        height: 20,
        text: 'View Demo',
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        fill: '#E2E8F0',
        parentId: frameId,
      },
    ];

    return {
      title: 'Hero Landing Banner',
      explanation: 'Expansive landing hero component complete with feature announcement tag, high-impact headline, sub-copy, and twin primary/secondary CTA buttons.',
      suggestedPrompts: [
        'Add a mock app preview card underneath',
        'Add logos of trusted partner companies',
      ],
      nodes,
    };
  }

  // 7. GENERIC SMART COMPONENT GENERATOR FOR ANY OTHER PROMPT
  const frameId = genId('frame_gen');
  const cardId = genId('rect_card');
  const titleId = genId('text_title');
  const bodyId = genId('text_body');
  const btnId = genId('rect_btn');
  const btnTextId = genId('text_btn');
  const decorCircle = genId('ellipse_decor');

  const cleanTitle = prompt.length > 30 ? `${prompt.substring(0, 27)}...` : prompt;

  const nodes: DesignNodeData[] = [
    {
      id: frameId,
      type: 'frame',
      name: `${cleanTitle} Component`,
      x: baseX,
      y: baseY,
      width: 400,
      height: 280,
      fill: '#1A1D24',
      stroke: '#2E384D',
      strokeWidth: 1,
      cornerRadius: 18,
      clipContent: true,
      childrenIds: [decorCircle, titleId, bodyId, btnId, btnTextId],
    },
    {
      id: decorCircle,
      type: 'ellipse',
      name: 'Accent Glow',
      x: baseX + 320,
      y: baseY - 30,
      width: 120,
      height: 120,
      fill: '#0D99FF',
      opacity: 0.25,
      parentId: frameId,
    },
    {
      id: titleId,
      type: 'text',
      name: 'Component Title',
      x: baseX + 28,
      y: baseY + 32,
      width: 320,
      height: 32,
      text: cleanTitle.toUpperCase(),
      fontSize: 20,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      fill: '#FFFFFF',
      parentId: frameId,
    },
    {
      id: bodyId,
      type: 'text',
      name: 'Component Description',
      x: baseX + 28,
      y: baseY + 76,
      width: 340,
      height: 60,
      text: `AI generated layout for: "${prompt}". You can modify typography, colors, borders, and position in the properties panel.`,
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'normal',
      fill: '#94A3B8',
      parentId: frameId,
    },
    {
      id: btnId,
      type: 'rectangle',
      name: 'Action Button',
      x: baseX + 28,
      y: baseY + 180,
      width: 180,
      height: 44,
      fill: '#0D99FF',
      cornerRadius: 10,
      parentId: frameId,
    },
    {
      id: btnTextId,
      type: 'text',
      name: 'Button Label',
      x: baseX + 28,
      y: baseY + 193,
      width: 180,
      height: 20,
      text: 'Explore Design',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 'bold',
      textAlign: 'center',
      fill: '#FFFFFF',
      parentId: frameId,
    },
  ];

  return {
    title: 'Custom AI Component',
    explanation: `Successfully synthesized a custom design layout tailored to your prompt: "${prompt}".`,
    suggestedPrompts: [
      'Make this layout wider',
      'Change color scheme to Emerald / Green',
      'Add a second action button',
    ],
    nodes,
  };
}

