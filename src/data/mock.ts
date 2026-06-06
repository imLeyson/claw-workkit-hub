import type {
  Project,
  Material,
  TaskCard,
  AIResult,
  Report,
  WorkKit,
  ReviewSample,
  CustomerQuery,
  CopySnippet,
} from '../types'

// ─── Projects ────────────────────────────────────────────

export const mockProjects: Project[] = [
  {
    id: 'p1', slug: '618-hair-dryer',
    name: '618 高速吹风机竞品评论分析',
    description:
      '针对米家 H700、飞科 F8、徕芬 SE 三款高速吹风机的用户评论进行深度分析，输出用户痛点、卖点机会、客服 FAQ、直播话术与详情页优化建议。',
    category: '个护小家电',
    campaign: '618 年中大促',
    competitors: [
      {
        name: '米家高速吹风机 H700',
        brand: '小米米家',
        platform: '京东',
        price: '¥499',
        reviewCount: 426,
        rating: 91.4,
        topIssues: ['噪音偏大', '风嘴松动', '发热明显'],
      },
      {
        name: '飞科高速吹风机 F8',
        brand: '飞科',
        platform: '天猫',
        price: '¥329',
        reviewCount: 389,
        rating: 88.7,
        topIssues: ['风力不足', '塑料感强', '售后响应慢'],
      },
      {
        name: '徕芬高速吹风机 SE',
        brand: '徕芬',
        platform: '抖音商城',
        price: '¥599',
        reviewCount: 471,
        rating: 93.2,
        topIssues: ['价格偏高', '按键误触', '声音尖锐'],
      },
    ],
    status: 'in_progress',
    createdAt: '2026-06-01',
    team: [
      { name: '张运营', role: 'operations' },
      { name: '李商品', role: 'merchandise' },
      { name: '王文案', role: 'copywriting' },
      { name: '赵客服', role: 'customer_service' },
      { name: '陈设计', role: 'design' },
    ],
  },
  {
    id: 'p2', slug: '618-robot-vacuum',
    name: '618 扫地机器人竞品分析',
    description: '针对科沃斯、石头、追觅三款旗舰扫地机器人的用户评论与参数进行深度分析。',
    category: '智能家居',
    campaign: '618 年中大促',
    competitors: [
      { name: '科沃斯 X2', brand: '科沃斯', platform: '京东', price: '¥3,999', reviewCount: 312, rating: 90.5, topIssues: ['避障误判', '耗材成本高'] },
      { name: '石头 G20', brand: '石头科技', platform: '天猫', price: '¥4,299', reviewCount: 285, rating: 92.1, topIssues: ['划伤地板', '地图丢失'] },
      { name: '追觅 X30 Pro', brand: '追觅', platform: '抖音商城', price: '¥3,899', reviewCount: 378, rating: 91.8, topIssues: ['噪音偏大', '水量控制不稳'] },
    ],
    status: 'in_progress',
    createdAt: '2026-06-03',
    team: [
      { name: '张运营', role: 'operations' },
      { name: '李商品', role: 'merchandise' },
    ],
  },
  {
    id: 'p3', slug: 'q2-mom-baby',
    name: 'Q2 母婴用品用户洞察',
    description: '分析母婴类目用户复购动机、安全焦虑与内容偏好。',
    category: '母婴用品',
    campaign: '日常分析',
    competitors: [
      { name: 'Babycare 纸尿裤', brand: 'Babycare', platform: '天猫', price: '¥89', reviewCount: 520, rating: 94.0, topIssues: ['尺寸偏小', '漏尿'] },
      { name: '全棉时代棉柔巾', brand: '全棉时代', platform: '京东', price: '¥59', reviewCount: 610, rating: 95.5, topIssues: ['掉絮', '厚度不足'] },
    ],
    status: 'completed',
    createdAt: '2026-04-15',
    team: [
      { name: '张运营', role: 'operations' },
      { name: '王文案', role: 'copywriting' },
    ],
  },
]

// ─── Review Samples ──────────────────────────────────────

export const mockReviewSamples: ReviewSample[] = [
  { id: 'rv1', competitorId: 'm1', text: '风速确实快，吹干只要3分钟。但是开到最大档声音有点尖，半夜洗头吹头发怕吵到孩子。', rating: 4, platform: '京东', sentiment: 'neutral', topic: '噪音' },
  { id: 'rv2', competitorId: 'm1', text: '用了三个月，风嘴开始松动，吹着吹着就掉了，质感不太行。', rating: 2, platform: '京东', sentiment: 'negative', topic: '做工' },
  { id: 'rv3', competitorId: 'm1', text: '热风档吹久了机身有点烫手，夏天用体验不好。', rating: 3, platform: '天猫', sentiment: 'negative', topic: '发热' },
  { id: 'rv4', competitorId: 'm1', text: '颜值高，风力大，干发快，这个价格性价比没话说。', rating: 5, platform: '京东', sentiment: 'positive', topic: '性价比' },
  { id: 'rv5', competitorId: 'm2', text: '风吹出来感觉力道不够，长发吹了好久才干，不如宣传的那么强。', rating: 2, platform: '天猫', sentiment: 'negative', topic: '风力' },
  { id: 'rv6', competitorId: 'm2', text: '到手发现塑料感真的很重，摸起来廉价，300多块的质感匹配不上。', rating: 3, platform: '天猫', sentiment: 'negative', topic: '质感' },
  { id: 'rv7', competitorId: 'm2', text: '售后客服排队半个小时，寄修等了十天才回来，再也不买了。', rating: 1, platform: '京东', sentiment: 'negative', topic: '售后' },
  { id: 'rv8', competitorId: 'm2', text: '轻便小巧，出差带着很方便，风力日常够用。', rating: 4, platform: '天猫', sentiment: 'positive', topic: '便携' },
  { id: 'rv9', competitorId: 'm3', text: '吹完头发真的很顺，负离子效果明显，比之前用的好太多了。就是价格小贵。', rating: 5, platform: '抖音商城', sentiment: 'positive', topic: '护发效果' },
  { id: 'rv10', competitorId: 'm3', text: '按键位置设计有问题，每次吹着吹着误触就关机了，太烦。', rating: 3, platform: '抖音商城', sentiment: 'negative', topic: '设计' },
  { id: 'rv11', competitorId: 'm3', text: '高速模式下声音很尖，像吹哨子一样，头皮发麻。', rating: 2, platform: '天猫', sentiment: 'negative', topic: '噪音' },
  { id: 'rv12', competitorId: 'm3', text: '六百块不算便宜了，但是跟戴森比确实很能打，就是按键这些小细节要优化。', rating: 4, platform: '京东', sentiment: 'neutral', topic: '性价比' },
  { id: 'rv13', competitorId: 'm7', text: '用了一个月，避障功能偶尔会把拖鞋当成障碍物绕开，但地毯就撞上去。整体清洁效果还是满意的。', rating: 3, platform: '京东', sentiment: 'neutral', topic: '避障' },
  { id: 'rv14', competitorId: 'm7', text: '耗材太贵了，尘袋和拖布两三个月就得换，一年下来耗材都快赶上机器价格了。', rating: 2, platform: '京东', sentiment: 'negative', topic: '耗材' },
  { id: 'rv15', competitorId: 'm7', text: '扫地很干净，拖地功能也不错。基站自清洁很方便，不用自己洗拖布。解放双手神器！', rating: 5, platform: '天猫', sentiment: 'positive', topic: '清洁效果' },
  { id: 'rv16', competitorId: 'm7', text: '大户型清扫一次电量不够用，得中途回充再继续。续航要是能再强一点就好了。', rating: 3, platform: '京东', sentiment: 'negative', topic: '续航' },
  { id: 'rv17', competitorId: 'm8', text: '用了两周，发现实木地板上有轻微划痕，不确定是不是机器造成的，但之前没有。', rating: 2, platform: '天猫', sentiment: 'negative', topic: '划伤地板' },
  { id: 'rv18', competitorId: 'm8', text: '地图经常丢失，已经重新建图三次了。大户型一次建图要跑一个小时，心累。', rating: 1, platform: '京东', sentiment: 'negative', topic: '地图' },
  { id: 'rv19', competitorId: 'm8', text: '吸力真的强，猫毛狗毛全都吸干净了。APP 操作也很方便，可以分区设置不同的清洁模式。', rating: 5, platform: '天猫', sentiment: 'positive', topic: '吸力' },
  { id: 'rv20', competitorId: 'm8', text: '避障比我家之前的科沃斯好太多了，数据线和小玩具都能识别绕开。就是价格偏高。', rating: 4, platform: '京东', sentiment: 'positive', topic: '避障' },
  { id: 'rv21', competitorId: 'm13', text: '清洁效果很好，拖地也很干净。但开到最大吸力的时候声音真的不小，晚上不敢用，怕吵到楼下邻居。', rating: 4, platform: '抖音商城', sentiment: 'neutral', topic: '噪音' },
  { id: 'rv22', competitorId: 'm13', text: '拖地功能水箱水量控制不太稳定，有时候太湿有时候又干了。希望能固件升级优化。', rating: 3, platform: '京东', sentiment: 'negative', topic: '水量' },
  { id: 'rv23', competitorId: 'm13', text: '性价比真的高！不到四千块买到这么多功能，基站自清洁、自动集尘全都有。国货崛起了。', rating: 5, platform: '抖音商城', sentiment: 'positive', topic: '性价比' },
  { id: 'rv24', competitorId: 'm13', text: '外观设计很好看，白色机身很有质感。APP 操作也很流畅，家里老人也能轻松用。', rating: 5, platform: '京东', sentiment: 'positive', topic: '设计' },
]

// ─── Customer Queries ─────────────────────────────────────

export const mockCustomerQueries: CustomerQuery[] = [
  { id: 'cq1', question: '这个吹风机跟戴森比哪个好？', category: 'pre_sale', frequency: 'high', riskLevel: 'normal' },
  { id: 'cq2', question: '吹完头发会不会很毛躁？我是细软发质。', category: 'pre_sale', frequency: 'high', riskLevel: 'normal' },
  { id: 'cq3', question: '噪音多大？会吵到家人吗？', category: 'pre_sale', frequency: 'high', riskLevel: 'normal' },
  { id: 'cq4', question: '风嘴是磁吸的还是卡扣的？容易掉吗？', category: 'pre_sale', frequency: 'medium', riskLevel: 'normal' },
  { id: 'cq5', question: '热风档温度多高，会不会烫伤头皮？', category: 'pre_sale', frequency: 'medium', riskLevel: 'caution' },
  { id: 'cq6', question: '收到就坏了怎么退？有没有上门取件？', category: 'after_sale', frequency: 'high', riskLevel: 'high' },
  { id: 'cq7', question: '用了两个月风力变小了能保修吗？', category: 'after_sale', frequency: 'medium', riskLevel: 'caution' },
  { id: 'cq8', question: '退货运费谁出？七天无理由退货包运费吗？', category: 'after_sale', frequency: 'high', riskLevel: 'high' },
]

// ─── Copy Snippets ────────────────────────────────────────

export const mockCopySnippets: CopySnippet[] = [
  { id: 'cp1', type: 'detail_page', content: '高速数码马达，每分钟11万转，3分钟速干长发。智能温控技术，恒温护发不伤发质。', source: '米家 H700 详情页' },
  { id: 'cp2', type: 'livestream', content: '姐妹们看我的头发！刚洗完就吹成这样，不打结不毛躁。今天618只要299，再送磁吸风嘴一个！', source: '飞科 F8 直播回放' },
  { id: 'cp3', type: 'xiaohongshu', content: '徕芬SE真实使用感受：颜值拉满，吹完头发很顺，但是按键太容易误触了。适合发量少到中等的姐妹。#高速吹风机测评', source: '小红书博主' },
  { id: 'cp4', type: 'campaign', content: '618年中大促：个护小家电专场。高速吹风机到手价¥249起，晒单返现20元。限时赠磁吸风嘴+收纳袋。', source: '往期618活动方案' },
]

// ─── Materials ────────────────────────────────────────────

export const mockMaterials: Record<string, Material[]> = {
  p1: [
    {
      id: 'm1', projectId: 'p1', type: 'review', label: '米家 H700 用户评论',
      fileName: 'mijia-h700-reviews.xlsx', content: '京东+天猫共426条评论，好评率91.4%，差评集中在噪音和发热。',
      uploadedAt: '2026-06-02 10:30', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t1', 't2', 't3', 't4', 't5'], reviewCount: 426, rating: 91.4, platform: '京东', price: '¥499',
      topIssues: ['噪音偏大', '风嘴松动', '发热明显'],
    },
    {
      id: 'm2', projectId: 'p1', type: 'review', label: '飞科 F8 用户评论',
      fileName: 'flyco-f8-reviews.xlsx', content: '天猫+京东共389条评论，好评率88.7%，差评集中在风力不足和塑料感。',
      uploadedAt: '2026-06-02 10:35', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t1', 't2', 't3', 't4'], reviewCount: 389, rating: 88.7, platform: '天猫', price: '¥329',
      topIssues: ['风力不足', '塑料感强', '售后响应慢'],
    },
    {
      id: 'm3', projectId: 'p1', type: 'review', label: '徕芬 SE 用户评论',
      fileName: 'laifen-se-reviews.xlsx', content: '抖音商城+京东共471条评论，好评率93.2%，差评集中在价格和按键设计。',
      uploadedAt: '2026-06-02 10:40', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t1', 't2', 't3', 't4'], reviewCount: 471, rating: 93.2, platform: '抖音商城', price: '¥599',
      topIssues: ['价格偏高', '按键误触', '声音尖锐'],
    },
    {
      id: 'm4', projectId: 'p1', type: 'spec', label: '三品牌商品参数对比表',
      fileName: 'competitor-specs.xlsx', content: '三款竞品吹风机的马达转速、功率、重量、温度档位、风嘴类型等参数对比。',
      uploadedAt: '2026-06-02 11:00', aiStatus: 'readable', sensitivity: 'need_review', responsibleRole: 'merchandise',
      referencedBy: ['t1', 't2', 't5'], price: '¥329-¥599',
    },
    {
      id: 'm5', projectId: 'p1', type: 'faq', label: '客服高频问题记录',
      fileName: 'cs-faq-log.xlsx', content: '近3个月售前售后共52条高频问题，覆盖比价、噪音、售后、退货等话题。',
      uploadedAt: '2026-06-02 11:15', aiStatus: 'readable', sensitivity: 'sensitive', responsibleRole: 'customer_service',
      referencedBy: ['t3', 't4'],
    },
    {
      id: 'm6', projectId: 'p1', type: 'copy_asset', label: '历史文案素材库',
      fileName: 'copy-assets.xlsx', content: '包含详情页文案、直播话术回放、小红书种草帖和往期活动方案共4份历史内容。',
      uploadedAt: '2026-06-02 11:20', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'copywriting',
      referencedBy: ['t2', 't4', 't5'],
    },
  ],
  p2: [
    {
      id: 'm7', projectId: 'p2', type: 'review', label: '科沃斯 X2 用户评论',
      fileName: 'ecovacs-x2-reviews.xlsx', content: '京东平台312条评论，好评率90.5%，差评集中在避障误判和耗材成本。',
      uploadedAt: '2026-06-03 14:00', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t6', 't7', 't8'], reviewCount: 312, rating: 90.5, platform: '京东', price: '¥3,999',
      topIssues: ['避障误判', '耗材成本高'],
    },
    {
      id: 'm8', projectId: 'p2', type: 'review', label: '石头 G20 用户评论',
      fileName: 'roborock-g20-reviews.xlsx', content: '天猫平台285条评论，好评率92.1%，差评集中在划伤地板和地图丢失。',
      uploadedAt: '2026-06-03 14:15', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t6', 't7'], reviewCount: 285, rating: 92.1, platform: '天猫', price: '¥4,299',
      topIssues: ['划伤地板', '地图丢失'],
    },
    {
      id: 'm9', projectId: 'p2', type: 'spec', label: '扫地机器人参数对比表',
      fileName: 'robot-vacuum-specs.xlsx', content: '科沃斯X2、石头G20与追觅X30 Pro的吸力、续航、避障技术、基站功能等参数对比。',
      uploadedAt: '2026-06-03 14:30', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t6', 't8'], price: '¥3,899-¥4,299',
    },
    {
      id: 'm13', projectId: 'p2', type: 'review', label: '追觅 X30 Pro 用户评论',
      fileName: 'dreame-x30pro-reviews.xlsx', content: '抖音商城+京东共378条评论，好评率91.8%，差评集中在噪音偏大和水箱水量控制不稳。',
      uploadedAt: '2026-06-04 10:00', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t6', 't7', 't8'], reviewCount: 378, rating: 91.8, platform: '抖音商城', price: '¥3,899',
      topIssues: ['噪音偏大', '水量控制不稳'],
    },
  ],
  p3: [
    {
      id: 'm10', projectId: 'p3', type: 'review', label: 'Babycare 纸尿裤用户评论',
      fileName: 'babycare-diapers-reviews.xlsx', content: '天猫平台520条评论，好评率94.0%，差评集中在尺寸偏小和漏尿问题。',
      uploadedAt: '2026-04-10 09:00', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t9', 't10'], reviewCount: 520, rating: 94.0, platform: '天猫', price: '¥89',
      topIssues: ['尺寸偏小', '漏尿'],
    },
    {
      id: 'm11', projectId: 'p3', type: 'review', label: '全棉时代棉柔巾用户评论',
      fileName: 'purcotton-wipes-reviews.xlsx', content: '京东平台610条评论，好评率95.5%，差评集中在掉絮和厚度不足。',
      uploadedAt: '2026-04-10 09:15', aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise',
      referencedBy: ['t9', 't10'], reviewCount: 610, rating: 95.5, platform: '京东', price: '¥59',
      topIssues: ['掉絮', '厚度不足'],
    },
    {
      id: 'm12', projectId: 'p3', type: 'faq', label: '母婴客服高频问题记录',
      fileName: 'mom-baby-faq.xlsx', content: '近半年售前售后共38条高频问题，覆盖安全性、材质、退换货等话题。',
      uploadedAt: '2026-04-10 09:30', aiStatus: 'readable', sensitivity: 'sensitive', responsibleRole: 'customer_service',
      referencedBy: ['t11'],
    },
  ],
};

// ─── Task Cards ───────────────────────────────────────────

export const mockTaskCards: Record<string, TaskCard[]> = {
  p1: [
    {
      id: 't1', projectId: 'p1', role: 'merchandise', title: '竞品商品分析',
      description: '从竞品评论中识别产品问题、功能机会和用户未被满足的需求，输出选品与定价参考。',
      status: 'submitted', assignedTo: '李商品',
      inputMaterials: ['m1', 'm2', 'm3', 'm4'],
      promptPreview: '你是一位电商选品经理。请分析竞品吹风机的用户评论，识别TOP5产品问题和功能机会，按严重度和频次排序，输出选品建议。',
      outputFormat: '产品问题表 · 功能机会 · 选品建议',
      judgmentCriteria: ['问题分类是否清晰', '频次和严重度是否有数据支撑', '选品建议是否可落地'],
      sourceTags: ['竞品评论', '商品参数'],
    },
    {
      id: 't2', projectId: 'p1', role: 'copywriting', title: '卖点文案生成',
      description: '提取用户原话，将真实痛点转化为详情页、直播和种草文案中的卖点表达。',
      status: 'ready', assignedTo: '王文案',
      inputMaterials: ['m1', 'm2', 'm3', 'm4', 'm6'],
      promptPreview: '你是一位资深电商文案。请基于竞品评论中的用户原话，将每个痛点转译为可感知、可量化、可传播的商品卖点文案。',
      outputFormat: '卖点文案库 · 用户原话摘录 · 标题方向',
      judgmentCriteria: ['卖点是否可量化验证', '是否引用了真实用户语言', '标题是否可传播'],
      sourceTags: ['竞品评论', '商品参数', '历史文案'],
    },
    {
      id: 't3', projectId: 'p1', role: 'customer_service', title: '客服 FAQ 与风险话术',
      description: '整理售前疑虑和售后风险，生成可直接用于客服培训和详情页说明的 FAQ。',
      status: 'ready', assignedTo: '赵客服',
      inputMaterials: ['m1', 'm2', 'm3', 'm5'],
      promptPreview: '你是一位客服培训主管。请基于用户高频问题和评论中的疑虑，结合现有FAQ，生成包含风险等级标注的客服应答模板。',
      outputFormat: '客服 FAQ · 风险话术 · 售后解释',
      judgmentCriteria: ['是否覆盖售前和售后', '是否标注风险等级', '应答是否专业且口语化'],
      sourceTags: ['竞品评论', '客服记录'],
    },
    {
      id: 't4', projectId: 'p1', role: 'design', title: '详情页优化建议',
      description: '根据用户关注点和痛点优先级，重排详情页信息层级和首屏表达重点。',
      status: 'ready', assignedTo: '陈设计',
      inputMaterials: ['m1', 'm2', 'm3', 'm6'],
      promptPreview: '你是一位电商详情页UX专家。请基于用户评论中反映的关注点和决策逻辑，重新规划详情页模块顺序和首屏信息结构。',
      outputFormat: '详情页模块建议 · 首屏信息结构 · 图示化建议',
      judgmentCriteria: ['首屏是否包含核心决策信息', '信息层级是否匹配用户关注热度', '是否降低了决策门槛'],
      sourceTags: ['竞品评论', '历史文案'],
    },
    {
      id: 't5', projectId: 'p1', role: 'operations', title: '618 大促策略汇总',
      description: '汇总各岗位分析结果，判断618主推策略、价格表达和核心卖点排序，输出执行清单。',
      status: 'ready', assignedTo: '张运营',
      inputMaterials: ['m1', 'm2', 'm3', 'm4', 'm6'],
      promptPreview: '你是一位电商运营负责人。请综合商品、文案、客服和设计的分析结果，提炼618大促的主推策略和可执行清单。',
      outputFormat: '大促策略摘要 · 执行清单 · 风险提醒',
      judgmentCriteria: ['策略是否有数据支撑', '执行清单是否可落地', '是否识别了关键风险'],
      sourceTags: ['竞品评论', '商品参数', '历史文案'],
    },
  ],
  p2: [
    {
      id: 't6', projectId: 'p2', role: 'merchandise', title: '竞品商品分析',
      description: '基于科沃斯X2和石头G20的用户评论，提取产品问题、功能机会和差异化选品建议。',
      status: 'submitted', assignedTo: '李商品',
      inputMaterials: ['m7', 'm8', 'm13', 'm9'],
      promptPreview: '你是一位智能家居选品经理。请分析科沃斯X2、石头G20和追觅X30 Pro的用户评论，识别TOP5产品问题和功能机会，输出选品建议。',
      outputFormat: '产品问题表 · 功能机会 · 选品建议',
      judgmentCriteria: ['覆盖核心竞品', '问题分类清晰', '选品建议可落地'],
      sourceTags: ['竞品评论', '商品参数'],
    },
    {
      id: 't7', projectId: 'p2', role: 'copywriting', title: '卖点文案生成',
      description: '基于扫地机器人用户评论中的核心诉求，将清洁效果和智能体验转化为可传播的卖点文案。',
      status: 'generated', assignedTo: '王文案',
      inputMaterials: ['m7', 'm8', 'm13'],
      promptPreview: '你是一位家电类目资深文案。请基于科沃斯、石头、追觅三家的用户评论中反映的清洁效果和智能体验诉求，生成可量化的卖点文案。',
      outputFormat: '卖点文案库 · 用户原话摘录 · 标题方向',
      judgmentCriteria: ['卖点是否可量化', '是否引用真实用户语言'],
      sourceTags: ['竞品评论'],
    },
    {
      id: 't8', projectId: 'p2', role: 'operations', title: '618 大促策略汇总',
      description: '综合商品分析和文案输出，提炼扫地机器人的618主推策略和价格表达。',
      status: 'generated', assignedTo: '张运营',
      inputMaterials: ['m7', 'm8', 'm13', 'm9'],
      promptPreview: '你是家电运营负责人。综合科沃斯、石头、追觅三家的商品和文案分析，为618扫地机器人大促提炼主推策略。',
      outputFormat: '大促策略摘要 · 执行清单',
      judgmentCriteria: ['策略有数据支撑', '执行清单可落地'],
      sourceTags: ['竞品评论', '商品参数'],
    },
  ],
  p3: [
    {
      id: 't9', projectId: 'p3', role: 'merchandise', title: '母婴用户痛点矩阵',
      description: '基于Babycare纸尿裤和全棉时代棉柔巾的用户评论，构建母婴品类用户痛点矩阵。',
      status: 'submitted', assignedTo: '李商品',
      inputMaterials: ['m10', 'm11'],
      promptPreview: '你是一位母婴品类选品专家。请基于用户评论，构建母婴用品的用户痛点矩阵和选品建议。',
      outputFormat: '用户痛点矩阵 · 选品建议',
      judgmentCriteria: ['痛点分类清晰', '建议有数据支撑'],
      sourceTags: ['竞品评论'],
    },
    {
      id: 't10', projectId: 'p3', role: 'copywriting', title: '商品卖点机会分析',
      description: '提取母婴用户评论中的安全焦虑和复购动机，转化为卖点机会。',
      status: 'submitted', assignedTo: '王文案',
      inputMaterials: ['m10', 'm11'],
      promptPreview: '你是一位母婴品牌文案。请基于用户评论中反映的安全焦虑和复购动机，提炼可传播的卖点机会。',
      outputFormat: '卖点机会清单 · 标题方向',
      judgmentCriteria: ['卖点是否抓住安全焦虑', '是否可传播'],
      sourceTags: ['竞品评论'],
    },
    {
      id: 't11', projectId: 'p3', role: 'customer_service', title: '母婴客服 FAQ',
      description: '整理母婴用户的售前高频疑虑和售后风险，生成客服应答模板。',
      status: 'submitted', assignedTo: '赵客服',
      inputMaterials: ['m10', 'm11', 'm12'],
      promptPreview: '你是一位母婴品类客服培训师。请基于用户评论和客服记录，生成风险等级标注的客服应答模板。',
      outputFormat: '客服 FAQ · 风险话术',
      judgmentCriteria: ['覆盖售前售后', '风险等级标注', '应答专业且亲和'],
      sourceTags: ['竞品评论', '客服记录'],
    },
  ],
}

// ─── AI Results ───────────────────────────────────────────

export const mockAIResults: Record<string, AIResult> = {
  t1: {
    id: 'r1', taskId: 't1', title: '竞品商品分析 - 618 高速吹风机',
    sections: [
      {
        title: '高频痛点聚类 Top 5',
        type: 'matrix',
        headers: ['痛点', '频次', '严重度', '影响面', '竞品覆盖', '可转化策略'],
        rows: [
          ['噪音偏大', '高 (62次)', '严重', '家庭用户/夜间使用', '3/3', '主打「低噪音风道」技术'],
          ['发热/烫手', '高 (48次)', '严重', '长发/高频用户', '2/3', '强调「恒温护发」卖点'],
          ['风力不足', '中 (35次)', '中等', '长发/厚发人群', '1/3', '突出「高速马达转速」数据'],
          ['做工/塑料感', '中 (29次)', '中等', '中高端用户', '2/3', '强化「质感机身」工艺细节'],
          ['售后响应慢', '低 (17次)', '严重', '全用户', '1/3', '承诺「急速售后」体系'],
        ],
      },
      {
        title: '用户原话摘录',
        type: 'quotes',
        quotes: [
          { text: '风速确实快，吹干只要3分钟。但是开到最大档声音有点尖，晚上洗头怕吵到孩子。', source: '京东 · 米家 H700 用户' },
          { text: '热风档吹久了机身有点烫手，夏天用体验不好。', source: '天猫 · 米家 H700 用户' },
          { text: '风吹出来感觉力道不够，长发吹了好久才干，不如宣传的那么强。', source: '天猫 · 飞科 F8 用户' },
          { text: '高速模式下声音很尖，像吹哨子一样，头皮发麻。', source: '天猫 · 徕芬 SE 用户' },
        ],
      },
      {
        title: '功能机会与选品建议',
        type: 'list',
        items: [
          '低噪高速风道设计：三个竞品的Top1差评均为噪音，是目前最大空白机会',
          '智能温控恒温：发热是第二名差评，恒温护发是可量化的差异化卖点',
          '质感机身 + 磁吸配件：用户对塑料感和风嘴松动的容忍度低，质感提升直接关联转化',
          '急速售后体系：售后慢是飞科的致命弱点，可作为对比攻击点',
          '定价参考区间：¥349-¥449 为高性价比甜点区间，避开¥599的高价和¥329的低质标签',
        ],
      },
    ],
    generatedAt: '2026-06-03 09:30', submitted: true,
  },
  t2: {
    id: 'r2', taskId: 't2', title: '卖点文案生成 - 618 高速吹风机',
    sections: [
      {
        title: '用户原话 → 卖点文案 转译',
        type: 'matrix',
        headers: ['用户原话', '痛点类型', '可转化卖点文案', '适用页面'],
        rows: [
          ['"声音有点尖，怕吵到孩子"', '噪音焦虑', '「55dB 图书馆级静音，宝贝安睡不打扰」', '详情页首屏'],
          ['"机身有点烫手"', '安全焦虑', '「智能恒温 50°C，贴头皮吹也不烫」', '详情页·直播间'],
          ['"长发吹了好久才干"', '效率焦虑', '「11万转高速马达，齐腰长发 3 分钟速干」', '主图·短视频'],
          ['"塑料感真的很重"', '品质焦虑', '「航空铝机身·磨砂触感，每一次触碰都是品质」', '详情页材质区'],
        ],
      },
      {
        title: '标题方向建议',
        type: 'bullet',
        items: [
          '「静音」+「速干」双卖点型：3分钟速干·55dB静音，晚上吹头发也不吵家人',
          '「性价比」对比型：11万转马达+智能恒温，只要戴森 1/3 的价格',
          '「护发」功能型：负离子 + 恒温护发，吹完不毛躁，细软发质救星',
          '「售后」安心型：30天无忧试用·2年整机质保·急速售后12小时响应',
        ],
      },
    ],
    generatedAt: '', submitted: false,
  },
  t3: {
    id: 'r3', taskId: 't3', title: '客服 FAQ 与风险话术 - 618 高速吹风机',
    sections: [
      {
        title: '售前高频问题（风险：中）',
        type: 'qa',
        qa: [
          { q: '这个吹风机跟戴森比哪个好？', a: '我们的11万转高速马达转速不输戴森，价格只有戴森的1/3。您可以看详情页的对比视频，吹干速度实测一样快。' },
          { q: '噪音多大？会吵到家人吗？', a: '最大档约55dB，相当于轻声交谈的音量。我们做了降噪风道设计，晚上用也不会太吵。您可以看评论区的噪音实测视频。' },
          { q: '吹完头发会不会毛躁？', a: '内置2000万负离子发生器，吹完顺滑不毛躁。细软发质的顾客反馈特别好，您可以看评论区实例图。' },
          { q: '热风档有多烫？安全吗？', a: '我们有智能温控芯片，每秒100次监测出风口温度，恒温在50°C左右。贴着头皮吹也不会烫伤。' },
        ],
      },
      {
        title: '售后风险话术（风险：高）',
        type: 'qa',
        qa: [
          { q: '收到就坏了怎么办？', a: '7天内质量问题直接换新，运费我们承担。您联系客服报订单号就行，急速售后12小时内响应处理。' },
          { q: '用了两个月风力变小了能保修吗？', a: '2年整机质保，不管是风力变小还是任何问题，您都可以寄回来免费维修。维修期间我们会提供备用机。' },
          { q: '退货运费谁出？', a: '7天无理由退换，拆封试用不满意也可退。退货运费我们承担，您不用出一分钱。' },
        ],
      },
    ],
    generatedAt: '', submitted: false,
  },
  t4: {
    id: 'r4', taskId: 't4', title: '详情页优化建议 - 618 高速吹风机',
    sections: [
      {
        title: '详情页模块重排建议',
        type: 'list',
        items: [
          '首屏（原第3屏→第1屏）：将「55dB静音+11万转马达」双卖点提至首屏，用动态对比视频替代静态KV',
          '第二屏（原第5屏→第2屏）：将「智能恒温50°C」安全卖点前置，配真人实测温度GIF',
          '第三屏（保持）：材质工艺展示区，强化「航空铝机身」质感，回应用户塑料感差评',
          '第四屏（新增）：用户原话+对比区，用真实评论截图构建信任',
          '第五屏（原第7屏→第5屏）：售后保障区前置，强调「2年质保+急速售后」，消除决策顾虑',
        ],
      },
      {
        title: '首屏信息结构',
        type: 'bullet',
        items: [
          '主标题：「3分钟速干·55dB静音 高速吹风机」',
          '副标题：「11万转数码马达 | 智能恒温护发 | 2000万负离子」',
          '信任标签：「2年整机质保 · 30天无忧试用 · 急速售后」',
          '限时标识：「618到手价 ¥349 起」',
          '配图建议：静音使用场景+吹干前后对比+质感特写',
        ],
      },
    ],
    generatedAt: '', submitted: false,
  },
  t6: {
    id: 'r6', taskId: 't6', title: '竞品商品分析 - 扫地机器人',
    sections: [
      {
        title: '高频痛点聚类 Top 5',
        type: 'matrix',
        headers: ['痛点', '频次', '严重度', '影响面', '竞品覆盖', '可转化策略'],
        rows: [
          ['避障误判', '高 (58次)', '严重', '有宠物/儿童家庭', '1/3', '主打「AI 视觉避障」技术'],
          ['划伤地板', '高 (38次)', '严重', '实木地板用户', '1/3', '强调「柔性橡胶滚刷」'],
          ['噪音偏大', '中 (34次)', '中等', '全用户/夜间使用', '2/3', '标注「静音模式」分贝值'],
          ['耗材成本高', '中 (31次)', '中等', '预算敏感用户', '1/3', '突出「耗材寿命长」数据'],
          ['地图丢失', '中 (22次)', '中等', '大户型用户', '1/3', '强化「LDS 激光导航」'],
        ],
      },
      {
        title: '竞品横向对比与选品建议',
        type: 'list',
        items: [
          '科沃斯 X2（¥3,999）：避障误判是主要差评，但清洁效果和基站体验受认可',
          '石头 G20（¥4,299）：划伤地板和地图丢失是致命弱点，但吸力和避障能力出色',
          '追觅 X30 Pro（¥3,899）：性价比最高但噪音大、水量控制不稳，适合预算敏感人群',
          '定价甜点区间 ¥3,500-¥4,000：追觅价格有优势但需解决噪音问题，科沃斯居中',
        ],
      },
    ],
    generatedAt: '2026-06-04 10:00', submitted: true,
  },
  t7: {
    id: 'r7', taskId: 't7', title: '卖点文案生成 - 扫地机器人',
    sections: [
      {
        title: '用户原话 → 卖点文案 转译',
        type: 'matrix',
        headers: ['用户原话', '痛点类型', '可转化卖点文案', '适用场景'],
        rows: [
          ['"耗材太贵了，一年下来快赶上机器价格"', '成本焦虑', '「零耗材设计·一年省下¥800」', '详情页·直播间'],
          ['"实木地板上有轻微划痕"', '安全焦虑', '「柔性橡胶滚刷·实木地板零划痕」', '详情页首屏'],
          ['"地图经常丢失，重新建图三次"', '体验焦虑', '「LDS 激光导航·一次建图永久记忆」', '详情页·主图'],
          ['"吸力真的强，猫毛全都吸干净了"', '清洁效果', '「5500Pa 飓风吸力·宠物家庭首选」', '主图·短视频'],
          ['"开到最大吸力声音真的不小"', '噪音焦虑', '「55dB 图书馆级静音·夜间不扰邻」', '详情页首屏'],
          ['"不到四千块功能全都有"', '性价比', '「三大旗舰配置·不到四千」', '主图·直播间'],
        ],
      },
      {
        title: '标题方向建议',
        type: 'bullet',
        items: [
          '「避障」+「不伤地板」双卖点型：AI 视觉避障·柔性滚刷，智能到不碰家具、温柔到不伤地板',
          '「吸力」性能型：5500Pa 飓风吸力，猫毛狗毛一吸而净 · 宠物家庭首选的扫地机器人',
          '「省心」体验型：基站自清洁 + 零耗材设计，一年省下 ¥800 · 真正的解放双手',
        ],
      },
    ],
    generatedAt: '2026-06-05 09:00', submitted: false,
  },
  t8: {
    id: 'r8', taskId: 't8', title: '618 大促策略 - 扫地机器人',
    sections: [
      {
        title: '618 主推策略',
        type: 'list',
        items: [
          '核心卖点：「AI 避障 + 静音 + 不伤地板」三维卖点，分别对标记科沃斯X2的避障误判、追觅X30 Pro的噪音问题和石头G20的划地板问题',
          '价格策略：618 到手价 ¥3,699（日常价 ¥3,999），卡位 ¥3,500-¥4,000 甜点区间，比追觅便宜 ¥200',
          '主推人群：28-40 岁有宠/有孩家庭，实木地板用户，追求智能家居体验',
          '对比策略：详情页重点对比两竞品的避障实测和地板保护数据，用真实视频构建信任',
        ],
      },
      {
        title: '直播话术框架（五段式）',
        type: 'bullet',
        items: [
          '开场（0-3min）：「618 最后 48 小时，今天给大家带来一台真正懂得避障的扫拖一体机——先看一段黑暗环境下避障挑战视频」',
          '痛点共鸣（3-6min）：「有没有家人买了扫地机，结果回家发现地板划了一道道的？今天这款搭载柔性橡胶滚刷，实木地板也能放心用」',
          '卖点演示（6-12min）：「左边这台某品牌，右边是我们的——大家看避障测试，数据线、拖鞋、宠物玩具全部精准绕开」',
          '信任背书（12-15min）：「京东好评率 90.5%，天猫评分 4.6，用户真实评论和避障测试视频都在屏幕上滚动」',
          '逼单（15-18min）：「618 专属价 3699，现在下单额外送一年耗材包+延保，只剩最后 150 单」',
        ],
      },
    ],
    generatedAt: '2026-06-06 11:00', submitted: false,
  },
  t9: {
    id: 'r9', taskId: 't9', title: '母婴用户痛点矩阵 - Q2 分析',
    sections: [
      {
        title: '用户核心痛点 Top 3',
        type: 'matrix',
        headers: ['痛点', '频次', '严重度', '竞品覆盖', '机会方向'],
        rows: [
          ['尺寸偏小', '高 (67次)', '严重', '1/2', '推出「分龄尺码指南」'],
          ['漏尿/侧漏', '高 (52次)', '严重', '1/2', '强化「防漏隔边」设计'],
          ['掉絮/起毛', '中 (28次)', '中等', '1/2', '强调「不掉絮」材质认证'],
        ],
      },
      {
        title: '复购动机分析',
        type: 'list',
        items: [
          '安全信任是第一决策因素：材质安全认证的展示直接影响转化率',
          '尺寸合适度是复购核心：建议增加试用装或分龄推荐功能',
          '品牌公众号内容的种草转化效率高于短视频 2.3 倍',
        ],
      },
    ],
    generatedAt: '2026-04-20 14:00', submitted: true,
  },
  t10: {
    id: 'r10', taskId: 't10', title: '商品卖点机会 - Q2 母婴',
    sections: [
      {
        title: '用户原话 → 卖点 转译',
        type: 'matrix',
        headers: ['用户原话', '痛点类型', '可转化卖点', '适用页面'],
        rows: [
          ['"穿了半天就漏了"', '安全焦虑', '「3D 防漏隔边，12小时不漏」', '详情页首屏'],
          ['"宝宝用了起红点"', '材质焦虑', '「0添加·医护级认证·敏感肌可用」', '详情页·主图'],
          ['"洗完脸一脸棉絮"', '品质焦虑', '「不掉絮·高压水刺工艺·100%棉」', '详情页材质区'],
        ],
      },
    ],
    generatedAt: '2026-04-21 10:00', submitted: true,
  },
  t11: {
    id: 'r11', taskId: 't11', title: '母婴客服 FAQ - Q2 分析',
    sections: [
      {
        title: '售前高频问题',
        type: 'qa',
        qa: [
          { q: '宝宝过敏体质能用吗？', a: '我们产品通过了医护级安全认证和皮肤刺激性测试，敏感肌宝宝也可以放心使用。您可以先买试用装体验，不满意可退。' },
          { q: '纸尿裤会不会起坨断层？', a: '采用日本住友高分子吸水树脂，吸水后不起坨不断层。评论区的宝妈反馈照片可以看效果。' },
        ],
      },
      {
        title: '售后风险话术',
        type: 'qa',
        qa: [
          { q: '红屁股了怎么办？', a: '非常抱歉！建议更换频率和做好护臀护理。如确认是产品问题，我们支持全额退款，运费我们承担。' },
        ],
      },
    ],
    generatedAt: '2026-04-21 14:00', submitted: true,
  },
  t5: {
    id: 'r5', taskId: 't5', title: '618 大促策略 - 高速吹风机',
    sections: [
      {
        title: '618 主推策略',
        type: 'list',
        items: [
          '核心卖点：「静音速干」双卖点，对标三个竞品Top1差评均为噪音，这是最大差异蓝海',
          '价格策略：618到手价 ¥349（日常价 ¥399），这个价格低于徕芬（¥599）高于飞科（¥329），卡位中端甜点区间',
          '主推人群：25-35岁女性，长发/中长发，有家庭（对噪音敏感），之前用传统吹风机',
          '对比策略：详情页重点对比三竞品的噪音实测数据，用真实分贝值构建信任',
        ],
      },
      {
        title: '直播话术框架（五段式）',
        type: 'bullet',
        items: [
          '开场（0-3min）：「618最后48小时，今天给大家带来一款3分钟速干的长发救星——先给大家听一段声音对比」',
          '痛点共鸣（3-6min）：「姐妹们有没有晚上洗头吹头发，吹风机声音大到把小孩吵醒的经历？今天这款只有55分贝」',
          '卖点演示（6-12min）：「左边这台某品牌，右边是我们的——大家看分贝仪，差了一倍！再看出风速度，看水珠蒸发的速度」',
          '信任背书（12-15min）：「京东好评率91.4%，天猫评分4.8，用户真实评论都在屏幕上滚动」',
          '逼单（15-18min）：「618专属价349，现在下单额外送磁吸风嘴+收纳袋，只剩最后200单，卖完恢复原价399」',
        ],
      },
    ],
    generatedAt: '', submitted: false,
  },
}

// ─── Reports ──────────────────────────────────────────────

export const mockReports: Record<string, Report> = {
  p3: {
    id: 'rep1', projectId: 'p3', title: 'Q2 母婴用品用户洞察 - 汇总报告',
    background: 'Q2 母婴用品用户洞察项目，通过分析 Babycare 和全棉时代的用户评论，提炼复购动机与安全焦虑，为下半年选品提供支撑。',
    dataScope: '覆盖 2 个品牌、4 个 SKU、1,130 条有效评论，时间跨度 2026年Q1-Q2。',
    executiveSummary: [
      '安全焦虑是母婴用户的第一决策因素，材质安全和认证展示直接影响转化率',
      '尺寸和舒适度是复购用户的核心关注点，建议增加试穿/体验装',
      '用户对品牌公众号内容有高信任度，种草转化效率高于短视频',
    ],
    sections: [
      { role: 'merchandise', roleLabel: '商品', results: [mockAIResults['t9']!] },
      { role: 'copywriting', roleLabel: '文案', results: [mockAIResults['t10']!] },
      { role: 'customer_service', roleLabel: '客服', results: [mockAIResults['t11']!] },
    ],
    nextSteps: [
      '将安全认证展示作为下半年的主要传播方向',
      '优化详情页材质说明和认证展示模块',
      '基于用户复购周期设计会员体验装方案',
      '将本次分析流程保存为 Work Kit 供双11复用',
    ],
    createdAt: '2026-04-22',
  },
}

// ─── Work Kits ────────────────────────────────────────────

export const mockWorkKits: WorkKit[] = [
  {
    id: 'wk1', name: '618 竞品评论分析 Work Kit', version: 'v1.2',
    basedOnProjectId: 'p3', basedOnProjectName: 'Q2 母婴用品用户洞察',
    description: '一套完整的电商竞品评论分析流程，覆盖商品分析、卖点文案、客服 FAQ、详情页优化和大促策略汇总。适用于618/双11大促前的品类竞品准备工作。',
    scenario: '618/双11/新品上架/爆品复盘',
    includedRoles: ['operations', 'merchandise', 'copywriting', 'customer_service', 'design'],
    materialStructure: '竞品评论数据(Excel) · 商品参数对比表 · 客服问题记录 · 历史文案素材库',
    sections: [
      { title: '竞品商品分析', role: 'merchandise', content: [{ title: '标准分析维度', type: 'list', items: ['频次统计：按用户评论中提及次数排序', '严重度评级：普通/中等/严重', '影响面评估：全用户/特定人群/特定场景', '竞品覆盖率：判断全行业问题还是单品缺陷'] }] },
      { title: '卖点文案转译', role: 'copywriting', content: [{ title: '用户原话 → 卖点 转译规则', type: 'list', items: ['噪音问题 → 低噪音风道技术', '发热烫手 → 智能恒温护发', '风力不足 → 高速马达转速', '做工粗糙 → 质感机身工艺'] }] },
    ],
    createdAt: '2026-04-25', tags: ['竞品分析', '618', '个护小家电', '多岗位'],
    feedback: 'v1.1增加了客服风险话术分类后反馈良好。商品团队建议在v1.2中增加「用户原话摘录」模块，已补充。',
    versionHistory: [
      { version: 'v1.0', date: '2026-04-25', changes: '初始模板：完成评论分析、岗位任务卡和报告结构。' },
      { version: 'v1.1', date: '2026-05-02', changes: '根据客服反馈，增加售前疑虑和售后风险分类，优化 FAQ 应答模板。' },
      { version: 'v1.2', date: '2026-05-10', changes: '根据设计反馈，增加首屏信息优先级和图示化建议，优化详情页模块排序。' },
    ],
    reuseCount: 3, rating: 4.8,
  },
  {
    id: 'wk2', name: '大促直播话术 Work Kit', version: 'v1.2',
    basedOnProjectId: 'p3', basedOnProjectName: 'Q2 母婴用品用户洞察',
    description: '基于商品卖点自动生成标准化直播话术框架，覆盖开场、痛点共鸣、卖点演示、信任背书和逼单五个环节，支持互动 Q&A 应答。',
    scenario: '618/双11期间直播场景，快速为不同品类生成标准化话术',
    includedRoles: ['operations', 'copywriting'],
    materialStructure: '商品卖点列表 · 用户评论高频词 · 竞品直播话术参考',
    sections: [
      { title: '五段式话术结构', role: 'copywriting', content: [{ title: '话术结构', type: 'bullet', items: ['开场钩子：用具体数字+悬念吸引停留', '痛点共鸣：用场景化描述引发认同', '卖点演示：前后对比/现场实测', '信任背书：数据+检测+真实反馈', '限时逼单：专属福利+稀缺性暗示'] }] },
    ],
    createdAt: '2026-05-10', tags: ['直播', '话术', '618', '转化'],
    feedback: '文案团队反馈开场钩子需要更强的数字支撑，v1.2已优化。直播间实测转化率提升23%。',
    versionHistory: [
      { version: 'v1.0', date: '2026-04-28', changes: '初始模板：五段式话术结构框架' },
      { version: 'v1.1', date: '2026-05-05', changes: '根据反馈增加互动Q&A应答模板，优化逼单环节的话术变体' },
      { version: 'v1.2', date: '2026-05-10', changes: '开场钩子增加数据锚点设计，直播间实测转化率提升23%' },
    ],
    reuseCount: 5, rating: 4.9,
  },
]

// ─── Shared Lookups ───────────────────────────────────────

export const roleLabels: Record<string, string> = {
  operations: '运营',
  merchandise: '商品',
  copywriting: '文案',
  customer_service: '客服',
  design: '设计',
}

export const roleIcons: Record<string, string> = {
  operations: '📊',
  merchandise: '📦',
  copywriting: '✍️',
  customer_service: '💬',
  design: '🎨',
}

export const sensitivityLabels: Record<string, string> = {
  normal: '正常', sensitive: '敏感资料', need_review: '需人工确认',
}

export const aiStatusLabels: Record<string, string> = {
  readable: 'AI 可读取', processing: '处理中', need_review: '需人工确认',
}

export const materialTypeLabels: Record<string, string> = {
  review: '竞品评论', spec: '商品参数', faq: '客服记录', copy_asset: '内容资产',
}

export const sourceTagLabels: Record<string, string> = {
  '竞品评论': '竞品评论',
  '商品参数': '商品参数',
  '客服记录': '客服记录',
  '历史文案': '历史文案',
}

export const platformColors: Record<string, string> = {
  '京东': 'bg-red-50 text-red-600',
  '天猫': 'bg-accent-50 text-accent-600',
  '抖音商城': 'bg-sky-50 text-sky-600',
  '拼多多': 'bg-amber-50 text-amber-600',
}
