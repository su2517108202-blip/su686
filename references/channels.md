# 模型与真实素材引用

准备所选模式、宿主附件或API请求时读取。使用当前真实合同；保存完整提交正文，必要时按该入口限制计量，不把历史字节失败变成全局上限。素材文件、参考用途、顺序和映射按实际记录；@文本、路径或编号不证明上传绑定。

## 当前九格路径

视频引用由D同版分镜派生且已经生成核对的剧情板，说明格与Shot的构图、站位和状态关系。输出正常连续单画面，排版仅作参考。B纯空间板用于环境几何，两者用途区分。

附当前人物服装版本及必要场景、物品参考，遵守所选入口合法额度。剧情板已充分表达某资产时可沿用，关键形制、文字或操作细节需要额外素材时补引用，不固定“所有人物+场景”占满图数。画镜用实际素材名与经核实的@规则；H3 API编号对应真实有序图片，解释各Subject内容及Picture作用。缺文件或映射保持准备状态，在正文外说明。

## H3按需参考

选择H3时读取[MiniMax官方入口](https://github.com/MiniMax-AI/MiniMax-H3/blob/d21241f0a4b3acbb34c97dae47fa417b7065e438/skills/h3-prompt-writing/SKILL.md)及所选模式的[base指南](https://github.com/MiniMax-AI/MiniMax-H3/blob/d21241f0a4b3acbb34c97dae47fa417b7065e438/skills/h3-prompt-writing/references/base-en.txt)或[Ref指南](https://github.com/MiniMax-AI/MiniMax-H3/blob/d21241f0a4b3acbb34c97dae47fa417b7065e438/skills/h3-prompt-writing/references/ref-en.txt)，来源固定为提交 `d21241f0a4b3acbb34c97dae47fa417b7065e438`。结构与语言按所选写法，提示词模板与API必填字段区分。以上为外部文档链接，使用时遵循其自身授权；本包不转载官方原文、快照或许可证，也不将它们纳入本包MIT许可。

[MiniMax官方V2](https://platform.minimax.io/docs/api-reference/video-generation-v2-create)用content的text及真实媒体项输入，原生first_frame/last_frame与reference_image/reference_video/reference_audio互斥。MiniMax-H3官方范围4–15整数秒，当前SEG工作流5–15整数秒，段内镜头可为有限正小数。目标比例、素材数量格式尺寸在真实提交时核对所选模型与渠道。

Ref2VA中，人物、服装版本、环境、物品等用Subject说明复用内容及图源；九格剧情板用独立Picture解释对应Shot与格的规划关系。其多格不产生多个原生时间锚。人物换装优先采用当前服装版本人物版本，使描述与图源一致。未知任务按[制作](production.md)保存原身份回查。
