// 攻略図鑑の本体（通常版 codex.html と 完全攻略版 guide.html で共通。body の data-mode が full なら完全攻略版）
(function () {
  "use strict";
  const W = window.WORLD || {}, C = window.CODEX || {}, H = W.heroes || {};
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const stars = n => `<span class="stars">${"★".repeat(n || 0)}</span>`;
  const rgb = c => c ? `rgb(${c[0]},${c[1]},${c[2]})` : "#888";
  const gods = H.gods || [];
  const god = key => gods.find(g => g.element === key) || { name: key, elementName: key, color: [128, 128, 128] };
  const typeName = t => ({ sword: "剣士", magic: "魔法使い", rider: "騎乗盗賊", bow: "弓使い", shield: "盾使い", axe: "斧使い", alchemy: "錬金術師" }[t] || t);
  const itemKeys = new Set((C.items || []).map(i => i.key));
  const itemLink = (key, name) => itemKeys.has(key) ? `<a class="chip" href="#item-${esc(key)}">${esc(name)}</a>` : `<span class="chip">${esc(name)}</span>`;
  const badge = s => s === "done" ? '<span class="badge done">実装済み</span>' : s === "wip" ? '<span class="badge wip">開発中</span>' : '<span class="badge idea">構想</span>';
  $("#gen").textContent = C.generated ? `データ作成: ${C.generated}` : "";

  // ---- 世界と都市 ----
  const questsByPlace = {};
  (C.quests || []).forEach(q => (questsByPlace[q.place] = questsByPlace[q.place] || []).push(q));
  const realms = [
    { id: "heaven", name: "天界 ― 雲の上の島々", how: "水色の次元の割れ目（始まりの村の外れ）", text: "浮島・神々の城・天空の聖都アウレリア。天界の魔物と雲ひつじ・天馬。浮島から地上へは滑空の翼布で降りられます。" },
    { id: "nether", name: "冥界 ― 魂の眠る静かな世界", how: "紫の次元の割れ目／エンド要塞の門", text: "死者の都ネクロポリス・スケルトンの集落・塔と祠。" },
    { id: "hell", name: "地獄 ― 黒曜の文明が眠る地の底", how: "赤の次元の割れ目／地下を深く掘る", text: "炎の民の都ヴォルカニア・魔王城・溶岩湖・オークの集落。恐竜のテイムもここで。" },
  ];
  let html = (W.cities || []).map(c => `<article class="card" id="place-${esc(c.id)}" data-k="${esc(c.name + c.title + c.text + c.lord)}">
      <h3>${esc(c.name)} <span class="sub">${esc(c.title || "")}・${esc(c.climate || "")}</span></h3>
      <p>${esc(c.text || "")}</p>
      <dl><dt>治める人</dt><dd>${esc(c.lord || "")}</dd><dt>住人</dt><dd>約 ${c.population} 人${c.nocturnal ? "（夜に暮らす）" : ""}</dd>
      <dt>施設</dt><dd>${(c.facilities || []).slice(0, 8).map(f => `<span class="chip">${esc(f)}</span>`).join("")}</dd>
      ${(((C.economy || {}).cities || {})[c.id]) ? `<dt>経済</dt><dd>${esc(C.economy.cities[c.id].note)}<br>安い: ${Object.entries(C.economy.cities[c.id].mul).filter(([, v]) => v < 1).map(([k, v]) => `<span class="chip">${esc((C.economy.categories[k] || {}).name || k)} ×${v}</span>`).join("")}<br>高い: ${Object.entries(C.economy.cities[c.id].mul).filter(([, v]) => v > 1).map(([k, v]) => `<span class="chip">${esc((C.economy.categories[k] || {}).name || k)} ×${v}</span>`).join("")}</dd>` : ""}
      ${questsByPlace[c.id] ? `<dt>大事な頼み</dt><dd>${questsByPlace[c.id].map(q => `<a class="chip" href="#quest-${esc(q.id)}">${esc(q.title)}</a>`).join("")}</dd>` : ""}</dl></article>`).join("");
  html += realms.map(r => `<article class="card" id="realm-${r.id}" data-k="${esc(r.name + r.text)}"><h3>${esc(r.name)} ${badge("done")}</h3><p>${esc(r.text)}</p>
      <dl><dt>行き方</dt><dd>${esc(r.how)}</dd><dt>出る魔物</dt><dd>${(C.enemies || []).filter(e => e.region === r.id).map(e => `<a class="chip" href="#mob-${esc(e.id)}">${esc(e.name)}</a>`).join("")}</dd></dl></article>`).join("");
  const M = C.museum || {};
  html += `<article class="card" id="place-museum" data-k="博物館 展示 模型 アーティファクト"><h3>冒険の博物館 ${badge("done")}</h3><p>始まりの村の空き地に村の大工が建てる。アーティファクトの展示台 21 台（飾ると効果）、ボス・三界・歴史の模型、七柱の宝珠、固有武器、魔物の模型の棚、冒険の記録の書見台。まだのものは影の形。</p>
      <dl><dt>ボスの模型</dt><dd>${(C.bosses || []).map(b => `<a class="chip" href="#boss-${esc(b.id)}"><span class="spoiler">${esc(b.name)}</span></a>`).join("")}</dd>
      <dt>歴史の模型</dt><dd>${Object.values(M.history || {}).map(h => `<span class="chip">${esc(h.name)}</span>`).join("")}（${Object.values(M.history || {}).map(h => esc(h.how)).join("・")}）</dd></dl></article>`;
  const S = C.sky || {};
  const dirName = a => ["北", "北東", "東", "南東", "南", "南西", "西", "北西"][Math.round(((a % 360) + 360) % 360 / 45) % 8];
  html += `<article class="card" id="place-observatory" data-k="天文台 望遠鏡 星座 星 夜 七つ星の並び 星の宝箱"><h3>星見の天文台 ${badge("done")}</h3><p>始まりの村の空き地に村の大工が建てる。中の望遠鏡を右クリックすると夜空を観測できる。星は 21 時の位置から 1 時間に 15 度ずつ西へ回る。昼は「夜まで待つ」、並びの夜は「七つ星の並びの夜まで眠る」で長く待たずに済む。星座を真ん中に入れて少し見つめると発見。</p>
      <dl><dt>七柱の星座（21 時の位置）</dt><dd>${(S.constellations || []).map(c => `<a class="chip" href="#god-${esc(c.god)}">${esc(c.name)}（${dirName(c.az)}・高さ ${c.alt}°）</a>`).join("")}</dd>
      <dt>星座を見つけると</dt><dd>その神の祠が地図に載る（祠の試練への手がかり）。図鑑「星座」に伝承が記録される</dd>
      <dt>${esc((S.alignment || {}).name || "七つ星の並び")}</dt><dd class="spoiler">${(S.alignment || {}).everyDays} 日ごとの夜（7 日目・14 日目…）、南の低い空（21 時に 南・高さ ${(S.alignment || {}).alt}°）に七色の星が一列に並ぶ。観測すると天界の神々の城のそばに「星の宝箱」の印。開けると ${((S.alignment || {}).reward || {}).coins} コインと星のかけら ×${((S.alignment || {}).reward || {}).count}（受取箱へ・1 回だけ）</dd></dl></article>`;
  html += `<article class="card" data-k="宿場 街道 馬宿 宿 農村"><h3>街道の宿場 <span class="sub">${(W.stops || []).length} か所</span></h3><p>都市を結ぶ街道に、宿・馬宿・農村が並びます。旅人と行商人が行き交い、祠では巡礼者が祈っています。</p>
      <p>${(W.stops || []).map(s => `<span class="chip">${esc(s.name)}</span>`).join("")}</p></article>`;
  $("#worldGrid").innerHTML = html;

  // ---- クエスト ----
  const qcards = (C.quests || []).map(q => `<article class="card" id="quest-${esc(q.id)}" data-k="${esc(q.title + q.giver + q.want + (q.placeName || ""))}" data-f="story">
      <h3>${esc(q.title)} ${badge("done")}</h3>
      <dl><dt>依頼主</dt><dd>${q.place ? `<a href="#place-${esc(q.place)}">${esc(q.giver)}</a>` : esc(q.giver)}</dd>
      <dt>開始条件</dt><dd>${q.requires ? `「${esc(q.requires)}」を終えたあと` : "話しかけると受けられる（名札の「！」）"}</dd>
      <dt>目的</dt><dd>${esc(q.want)}</dd>
      <dt>報酬</dt><dd>${q.coins} コイン・名声 ${q.fame}${(q.reward || []).length ? "・" + q.reward.map(esc).join("・") : ""}</dd>
      <dt>頼みの話</dt><dd class="spoiler">${esc(q.ask)}</dd>
      <dt>手がかり</dt><dd class="spoiler">${esc(q.hint)}</dd></dl></article>`);
  const daily = [
    ["手紙", "都市や宿場の住人から、別の町の誰かへ手紙を届ける。相手の名札に「〒」"],
    ["荷物", "荷物を届ける。届け先は町の役目のある人"],
    ["お使い", "決まった品を決まった数だけ持ってくる"],
    ["採掘", "鉱山都市の依頼。決まった採掘場で決まった鉱石を掘る（いつでも受けられる）"],
    ["石運び", "建設中の建物へ砂岩を運ぶ（砂の王都のピラミッド）"],
    ["契り", "吸血鬼の伯爵へ品を届けて契りを結ぶ"],
  ].map(([n, t]) => `<article class="card" data-k="${esc(n + t)}" data-f="daily"><h3>${esc(n)} ${badge("done")}</h3><p>${esc(t)}</p><p class="meta">日ごとに変わる頼みごと。報酬はコインと名声。期限はありません。</p></article>`);
  $("#questGrid").innerHTML = qcards.concat(daily).join("");
  filters("#questFilters", "#questGrid", [["all", "すべて"], ["story", "大事な頼み"], ["daily", "日ごとの頼みごと"]]);

  // ---- キャラクター ----
  const statNames = H.stats ? H.stats.map(s => s.name || s) : [];
  $("#heroGrid").innerHTML = (H.heroes || []).map(h => {
    const g = god(h.element);
    const top = (h.growth || []).map((v, i) => [v / Math.max(1, (h.growth || [])[0] ? 1 : 1), i]).slice(2).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, i]) => statNames[i]);
    const ws = (H.weapons || []).filter(w => (w.for || []).includes(h.type)).map(w => w.name);
    return `<article class="card" id="hero-${esc(h.id)}" data-k="${esc(h.name + h.title + typeName(h.type) + g.elementName + h.profile)}" data-f="${esc(h.type)}">
      <h3><span class="el" style="--c:${rgb(g.color)}"></span>${esc(h.name)} <span class="sub">${esc(h.title)}</span> ${stars(h.rarity)}</h3>
      <p>${esc(h.profile)}</p>
      <dl><dt>職業</dt><dd>${typeName(h.type)}</dd><dt>属性</dt><dd>${esc(g.elementName)}（<a href="#god-${esc(h.element)}">${esc(g.name)}</a>）</dd>
      <dt>HP / MP</dt><dd>${h.base[0]} / ${h.base[1]}（Lv1）</dd><dt>伸びやすい</dt><dd>${top.map(esc).join("・")}</dd>
      <dt>合う固有武器</dt><dd>${ws.length ? ws.map(n => `<span class="chip">${esc(n)}</span>`).join("") : "—"}</dd>
      <dt>入手</dt><dd>${h.starter ? "最初の仲間" : "ガチャ（★" + h.rarity + "）"}</dd>
      ${h.home ? `<dt>ふるさと</dt><dd><a href="#place-${esc(h.home)}">${esc(h.homeName || h.home)}</a>（この人で訪れると歓迎・店が 1 割引き）</dd>` : ""}
      ${h.birthday ? `<dt>誕生日</dt><dd>${+h.birthday.slice(0, 2)} 月 ${+h.birthday.slice(3)} 日</dd>` : ""}
      ${(h.friends || []).length ? `<dt>仲のよい相手</dt><dd>${h.friends.map(f => `<a class="chip" href="#hero-${esc(f)}">${esc(((H.heroes || []).find(x => x.id === f) || {}).name || f)}</a>`).join("")}</dd>` : ""}
      <dt>重複強化</dt><dd>同じ仲間が出たら、強化（最大 +5）か別の個体を選べる</dd></dl></article>`;
  }).join("");
  filters("#heroFilters", "#heroGrid", [["all", "すべて"], ["sword", "剣士"], ["magic", "魔法使い"], ["rider", "騎乗盗賊"], ["bow", "弓使い"], ["shield", "盾使い"], ["axe", "斧使い"], ["alchemy", "錬金術師"]]);

  // ---- 魔物 ----
  const regionName = r => ({ overworld: "地上", surface: "地上", hell: "地獄", nether: "冥界", heaven: "天界" }[r] || r);
  $("#mobGrid").innerHTML = (C.enemies || []).map(e => `<article class="card" id="mob-${esc(e.id)}" data-k="${esc(e.name + e.attack + e.where.join(""))}" data-f="${esc(e.region)}">
      <h3>${esc(e.name)} <span class="sub">${esc(e.attitude)}</span> ${badge("done")}</h3>
      <dl><dt>出る所</dt><dd>${e.where.map(esc).join("<br>")}</dd><dt>攻撃</dt><dd>${esc(e.attack)}</dd>
      <dt>強さ</dt><dd>HP ${e.hp}・攻撃 ${e.damage}</dd>
      <dt>落とす物</dt><dd>${e.drops.length ? e.drops.map(d => itemLink(d.key, d.name) + `<span class="meta">${Math.round(d.chance * 100)}%</span>`).join(" ") : "—"}</dd>
      ${e.tame ? `<dt>テイム</dt><dd>${esc(e.tame.food)}を ${e.tame.count} 個（仲良くなると乗れる・飼育場へ送れる）</dd>` : ""}</dl></article>`).join("");
  filters("#mobFilters", "#mobGrid", [["all", "すべて"], ["overworld", "地上・地下"], ["heaven", "天界"], ["nether", "冥界"], ["hell", "地獄"]]);
  $("#bossGrid").innerHTML = (C.bosses || []).map(b => `<article class="card" id="boss-${esc(b.id)}" data-k="${esc(b.name)}"><h3><span class="spoiler">${esc(b.name)}</span> ${badge("done")}</h3>
      <dl>${(M.bosses || {})[b.id] ? `<dt>出会う場所</dt><dd class="spoiler">${esc(M.bosses[b.id].where)}</dd><dt>伝承</dt><dd class="spoiler">${esc(M.bosses[b.id].story)}</dd>` : ""}<dt>落とす物</dt><dd class="spoiler">${(b.drops || []).map(d => itemLink(d.key, d.name)).join(" ") || "—"}</dd></dl></article>`).join("");

  // ---- 動物 ----
  const designMobs = (W.mobs || []).filter(m => m.status === "design");
  $("#animalGrid").innerHTML = (C.animals || []).map(a => `<article class="card" id="animal-${esc(a.id)}" data-k="${esc(a.name + a.food + a.produce)}">
      <h3>${esc(a.name)} ${badge("done")}</h3><dl><dt>好物</dt><dd>${esc(a.food)}</dd>${a.produce ? `<dt>くれる物</dt><dd>${esc(a.produce)}</dd>` : ""}
      <dt>できること</dt><dd>${[a.rideable ? "乗れる" : "", a.recall ? "飼育場へ送れる（T キー）" : "", a.wild ? "野で暮らす（驚くと逃げる）" : "村で暮らす"].filter(Boolean).join("・")}</dd></dl></article>`).join("")
    + designMobs.map(m => `<article class="card" data-k="${esc(m.name)}"><h3>${esc(m.name)} <span class="sub">${esc(m.clsName || "")}</span> ${badge("idea")}</h3><p class="meta">${esc(m.ability || "")}</p></article>`).join("");

  // ---- アイテム ----
  const recipeOf = {}, usedIn = {}, droppedBy = {}, sold = {};
  (C.recipes || []).forEach(r => { (recipeOf[r.result] = recipeOf[r.result] || []).push(r); r.ingredients.forEach(i => (usedIn[i.key] = usedIn[i.key] || []).push(r)); });
  (C.enemies || []).forEach(e => e.drops.forEach(d => (droppedBy[d.key] = droppedBy[d.key] || []).push(e)));
  (C.traders || []).forEach(t => t.trades.forEach(tr => tr.get.forEach(g => (sold[g.key] = sold[g.key] || []).push(`${t.name || "取引"}（${tr.give}）`))));
  const rarityName = r => ({ uncommon: "アンコモン", rare: "レア", epic: "エピック", legendary: "レジェンダリー" }[r] || "");
  $("#itemGrid").innerHTML = (C.items || []).map(it => {
    const rec = recipeOf[it.key] || [], use = usedIn[it.key] || [], drop = droppedBy[it.key] || [], buy = sold[it.key] || [];
    return `<article class="card" id="item-${esc(it.key)}" data-k="${esc(it.name + it.kindName + it.info)}" data-f="${esc(it.kind)}">
      <h3>${esc(it.name)} <span class="sub">${esc(it.kindName || "")}${rarityName(it.rarity) ? "・" + rarityName(it.rarity) : ""}</span></h3>
      ${it.info ? `<p class="meta">${esc(it.info)}</p>` : ""}
      <dl>${rec.map(r => `<dt>作り方</dt><dd>${esc(r.station)}: ${r.ingredients.map(i => itemLink(i.key, i.name) + "×" + i.count).join(" ")}${r.count > 1 ? `→ ${r.count} 個` : ""}</dd>`).join("")}
      ${drop.length ? `<dt>落とす魔物</dt><dd>${drop.map(e => `<a class="chip" href="#mob-${esc(e.id)}">${esc(e.name)}</a>`).join("")}</dd>` : ""}
      ${buy.length ? `<dt>取引</dt><dd>${buy.map(esc).join("<br>")}</dd>` : ""}
      ${use.length ? `<dt>使い道</dt><dd>${use.slice(0, 8).map(r => itemLink(r.result, r.name)).join("")}${use.length > 8 ? ` ほか ${use.length - 8}` : ""}</dd>` : ""}</dl></article>`;
  }).join("");
  filters("#itemFilters", "#itemGrid", [["all", "すべて"], ["material", "素材"], ["tool", "道具"], ["weapon", "武器"], ["armor", "防具"], ["accessory", "装身具"], ["consumable", "食べ物・薬"]]);

  // ---- 仲間の装備 ----
  const bonusText = b => b ? Object.entries(b).map(([k, v]) => `${({ hp: "HP", mp: "MP", patk: "物理攻撃", matk: "魔法攻撃", def: "防御", sword: "剣", axe: "斧", bow: "弓", alchemy: "錬金", dex: "器用", riding: "騎乗", mining: "採掘", farming: "農業", explore: "探索" })[k] || k} +${v}`).join("・") : "";
  $("#gearGrid").innerHTML = (H.weapons || []).map(w => `<article class="card" data-k="${esc(w.name + w.effect)}"><h3><span class="el" style="--c:${rgb(god(w.element).color)}"></span>${esc(w.name)} ${stars(w.rarity)} ${badge(/これから|未/.test(w.effect) ? "wip" : "done")}</h3>
      <dl><dt>種類</dt><dd>固有武器・${esc(god(w.element).elementName)}</dd><dt>攻撃</dt><dd>${w.attack}</dd><dt>効果</dt><dd>${esc(w.effect)}</dd><dt>装備できる</dt><dd>${(w.for || []).map(typeName).join("・")}</dd></dl></article>`).join("")
    + (H.orbs || []).map(o => `<article class="card" data-k="${esc(o.name)}"><h3><span class="el" style="--c:${rgb(god(o.element).color)}"></span>${esc(o.name)} ${badge("done")}</h3><dl><dt>種類</dt><dd>オーブ（${esc(god(o.element).elementName)}）</dd><dt>効果</dt><dd>${esc(bonusText(o.bonus))}（Lv で伸びる・同じ種類どうしで合体）</dd></dl></article>`).join("")
    + (H.costumes || []).map(c => `<article class="card" data-k="${esc(c.name)}"><h3>${esc(c.name)} ${stars(c.rarity)} ${badge("done")}</h3><dl><dt>種類</dt><dd>${({ season: "季節限定の衣装", skin: "特別なスキン", special: "特別な衣装（七柱巡礼）" })[c.kind] || "衣装"}</dd><dt>効果</dt><dd>${esc(bonusText(c.bonus))}</dd></dl></article>`).join("");

  // ---- アーティファクト ----
  const setName = s => ({ heaven: "天界", hell: "地獄", nether: "冥界", overworld: "地上" }[s] || s);
  $("#artifactGrid").innerHTML = (C.artifacts || []).map(a => `<article class="card" id="item-art-${esc(a.key)}" data-k="${esc(a.name + setName(a.set))}"><h3>${esc(a.name)} <span class="sub">${esc(setName(a.set))}の宝</span> ${badge("done")}</h3>
      <dl><dt>効果</dt><dd>${esc(a.bonus)}</dd><dt>手に入る所</dt><dd class="spoiler">${esc(a.hint)}</dd></dl></article>`).join("");

  // ---- 神々 ----
  const lantern = { fire: "朱", water: "群青", ice: "白藍", thunder: "黄金", green: "若葉", earth: "琥珀", wind: "浅緑" };
  $("#godGrid").innerHTML = gods.map(g => `<article class="card" id="god-${esc(g.element)}" data-k="${esc(g.name + g.elementName + g.lore)}"><h3><span class="el" style="--c:${rgb(g.color)}"></span>${esc(g.name)} <span class="sub">${esc(g.elementName)}</span> ${badge("done")}</h3>
      <p>${esc(g.lore)}</p><dl><dt>提灯の色</dt><dd><span class="el" style="--c:${rgb(g.color)}"></span>${esc(lantern[g.element] || g.elementName)}（夜は同じ色の光が舞う）</dd><dt>祠</dt><dd>${g.shrines} か所</dd>${((C.sky || {}).constellations || []).filter(c => c.god === g.element).map(c => `<dt>星座</dt><dd><a href="#place-observatory">${esc(c.name)}</a> — ${esc(c.story)}</dd>`).join("")}
      <dt>加護</dt><dd>祈った仲間の能力が上がる（同じ属性の仲間ほど強い・有効は 1 つ）</dd><dt>仲間</dt><dd>${(H.heroes || []).filter(h => h.element === g.element).map(h => `<a class="chip" href="#hero-${esc(h.id)}">${esc(h.name)}</a>`).join("") || "—"}</dd></dl></article>`).join("")
    + `<article class="card" data-k="七柱巡礼 称号 巡礼衣"><h3>七柱巡礼 ${badge("done")}</h3><p>1 人の仲間が七柱すべての加護を集めると、称号「七柱の巡礼者」と限定衣装「七彩の巡礼衣」。毎日の「今日の神」の属性の仲間は経験 1.5 倍。</p></article>`
    + `<article class="card" data-k="祠の試練 仕掛け"><h3>祠の小さな試練と伝承の欠片 ${badge("done")}</h3><p>祠のそばの封じられた結晶は、まつる神と同じ属性の仲間の技（X）でだけ解ける。解くと、その神の伝承の欠片（E のメニューの図鑑で読める）とオーブの欠片 3。</p></article>`;

  // ---- 歴史ディメンション（data/history.json から） ----
  const troopName = { infantry: "歩兵", shield: "盾兵", archer: "弓兵", cavalry: "騎兵" };
  const gateText = g => { const m = g.trim(); const op = m[0], rest = m.slice(1).split(" "); const v = rest[0], k = troopName[rest[1]] || (op === "+" ? "歩兵" : ""); return op === "+" ? `+${v} ${k}` : op === "x" ? `×${v}` : op === "/" ? `÷${v}` : `−${v}`; };
  const gateGood = g => g.trim()[0] === "+" || g.trim()[0] === "x";
  const courseHtml = c => (c || []).filter(Boolean).map(s => s.gate ? `<span class="chip" style="background:${gateGood(s.gate[0]) ? "#2f5fb0" : "#b04030"};color:#fff">左 ${esc(gateText(s.gate[0]))}</span><span class="chip" style="background:${gateGood(s.gate[1]) ? "#2f5fb0" : "#b04030"};color:#fff">右 ${esc(gateText(s.gate[1]))}</span>`
      : s.rocks ? `<span class="chip">落石 ${s.rocks[0] < -0.5 && s.rocks[1] <= 0.25 ? "左" : s.rocks[0] >= -0.25 && s.rocks[1] > 0.5 ? "右" : "まん中"}（−${s.rocks[2]}）</span>`
      : s.enemy ? `<span class="chip">敵の隊 ${s.enemy}</span>` : s.fortress ? `<span class="chip">砦 守り ${s.fortress}</span>` : "").join(" → ");
  const perks = "炎: 弓兵の矢 +30%・水: 敵とぶつかる損害 −15%・氷: 落石 −40%・雷: 騎兵の突撃 +40%・緑: 増える門 +10%・土: 盾兵の守り +50%・風: 左右の速さ +30%";
  $("#historyGrid").innerHTML = (C.history || []).map(d => {
    const ready = d.status === "implemented";
    const head = `<article class="card" id="history-${esc(d.id)}" data-k="${esc(d.name + d.era + d.genre + d.story)}"><h3>${esc(d.name)} <span class="sub">${esc(d.genre)}</span> ${badge(ready ? "done" : "wip")}</h3>
      <p>${esc(d.era)}。${esc(d.story)}</p>
      <dl><dt>入り方</dt><dd>始まりの村の外れ（村のワープの石から 14〜36 マス）の金色の「時の割れ目」に触れる → 時代・段階・仲間を選ぶ</dd>
      <dt>遊び方</dt><dd>${esc(d.howTo)}</dd>
      ${d.id === "pyramid" ? `<dt>パンができるまで</dt><dd>麦畑（12 秒で実る・刈ると麦 3）→ 石臼（麦 1 で粉 2・3.5 秒）→ こね台（粉 2 つまで・粉 1 で生地 2・1.2 秒）→ かまど（生地 4 つまで・6 秒、焼けたらもう一度クリックで取り出す）→ 店（お客さん 1 人に 2 個まで・1 個 3 デベン）／建設の人たちへ届ける（10 個ずつ・1 個 1 デベン）</dd><dt>広げる</dt><dd>畑 +4（30・60 デベン、12 面まで）・石臼 +1（30・60・90、4 台まで）・かまど +1（60・120、3 基まで）・店を広げる（50・100、お客さんが早く来る）</dd><dt>雇う</dt><dd>畑の人・粉ひきの人・パン焼きの人・売り子・運び手（30 デベンから 1 人ごとに +25）。運び手がいると、売り子は届ける分を残して売る</dd><dt>ピラミッド</dt><dd>届けたパン 400 個で冠石まで（200 個で半分）。最初は 20 デベン</dd><dt>仲間の属性の得意</dt><dd>炎: かまどが早い・水: 麦が早く実る・氷: 少し高く売れる・雷: お客さんが多い・緑: 刈ると麦 +1・土: 石臼が早い・風: 届けたパンでピラミッドが 2 割多く進む</dd>` : ""}
      ${d.id === "greatwall" ? `<dt>兵の得意</dt><dd>歩兵: 数で押す・盾兵: 落石と敵の損害を減らす・弓兵: ぶつかる前に矢で減らす（1 人で 0.5）・騎兵: 突撃で崩す（1 人で 0.6）。じゃんけんのような相性はありません</dd><dt>仲間の属性の得意</dt><dd>${esc(perks)}。職業が盾・弓・騎乗なら、その兵 5 人が最初からいる</dd>` : ""}
      <dt>最後の段階のごほうび</dt><dd class="spoiler">称号「${esc(d.title)}」・博物館に「${esc(d.name)}」の模型</dd>
      <dt>史実と簡略化</dt><dd>${(d.notes || []).map(n => esc(n)).join("<br>")}</dd></dl></article>`;
    const stages = (d.stages || []).map((s, i) => `<article class="card" id="history-${esc(d.id)}-${esc(s.id)}" data-k="${esc(d.name + s.name + s.goal)}"><h3>${esc(d.name)} ${i + 1}. ${esc(s.name)} ${badge(ready ? "done" : "wip")}</h3>
      <dl><dt>目標</dt><dd>${esc(s.goal)}</dd>
      <dt>はじめてのクリアの報酬</dt><dd>コイン ${s.coins}・経験の書 ×${s.xpBooks}${s.costume ? `・限定衣装「${esc(s.costume)}」` : ""}${s.item ? `・限定アーティファクト「${esc(s.item)}」` : ""}</dd>
      ${(s.course || []).filter(Boolean).length ? `<dt>道のり（ネタバレ）</dt><dd class="spoiler">${courseHtml(s.course)}</dd>` : ""}
      ${s.route ? `<dt>勝ち方の一例</dt><dd class="spoiler">門を ${[...s.route].map((r, k) => `${k + 1} つ目は${r}`).join("・")}でくぐり、落石はよける（このとおりに進むとクリアできることを自動テストで確かめています）</dd>` : ""}
      ${i > 0 ? `<dt>開く条件</dt><dd>「${esc(d.stages[i - 1].name)}」をクリア</dd>` : ""}</dl></article>`).join("");
    return head + stages;
  }).join("");

  // ---- 遊びの仕組み ----
  const sys = [
    ["操作", "done", "WASD で歩く・Space でジャンプ・Ctrl で走る・Shift でしゃがむ・左クリックで掘る/攻撃・右クリックで置く/使う/話す。E でメインメニュー、Tab で持ち物とマス目のクラフト、P で仲間、M で地図、J で記録帳、V で村の管理、R で操作する仲間を替える、X で属性の技、C で魔法、F5 で三人称。"],
    ["E キーのメインメニュー", "done", "中央に操作中のキャラクターの 3D の姿（回す・近づける）、左に機能の一覧、右に選んだ機能の内容。キャラクター・持ち物・装備・クラフト・クエスト・地図・図鑑・召喚・加護・交易・設定へ。どの画面も Esc で戻り、E で閉じる。"],
    ["持ち物の画面", "done", "分類（武器・道具／防具／素材／消耗品／貴重品／クエスト関連／建築）・並べ替え（レア度・種類・入手順・名前・数）・検索・大きな見本と性能・使い道・手に入る所。保護（お気に入り）した品は自動のクラフト・整理・捨てる・売るに使わない。複数選択・近くのチェストとの出し入れ・捨てるときの確認。"],
    ["召喚の画面", "done", "今までの泉の値段・確率・天井のまま、魔法陣と札が返る演出（とばせる）。提供割合・天井まであと何回・召喚の履歴。"],
    ["世界地図と目的地", "done", "拡大・縮小・ドラッグ。見つけた都市・村・祠・次元の割れ目・展望地点・名所に印と説明。目的地を決めると画面の上に方角と距離。"],
    ["戦闘", "done", "近づく魔物を剣や魔法で倒す。魔物は攻撃の前に身構えるので、見てから避けられる。同行の仲間も戦い、錬金術師は傷を癒やす。"],
    ["キャラクターの育成", "done", "経験で Lv が上がり、能力が伸びる。経験の書で育てることも。重複強化で最大 +5。"],
    ["ガチャ", "done", "ゲーム内のコインだけで回す（課金なし）。1 回 60・10 回 540（★4 以上 1 つ保証）。60 回でキャラクターの天井。"],
    ["パーティ", "done", "1〜5 人。操作する人を R で切り替えると、姿・能力・持ち物がその人に。"],
    ["オーブ", "done", "1 人 3 つまで。欠片で育て、同じ種類どうしで合体。同じ属性の仲間だと 1.25 倍。"],
    ["派遣", "done", "パーティ外の仲間を郊外の農場・石切り場・工房などへ。成果は 12 時間分までたまり、受取箱へ。働く姿がワールドに出る。"],
    ["農業・採掘・交易", "done", "畑を耕して育てる。都市の採掘場と鉱山。市場で売り買い、名産品の産地。"],
    ["都市ごとの経済", "done", "8 都市で品の分類ごとに値段が違う（作る都市は安く、運び込む都市は高い）。買うと品薄で高く、売るとあまって安くなる（最大 ±30%、毎日戻る）。同じ店では買い取りはいつも売り値より安い。交易所に派遣した仲間の器用で買い取りが最大 +12%。E のメニュー「交易」で値段と記録。"],
    ["星座と天体観測", "done", "村の天文台の望遠鏡で夜空を見る。七柱の神々の星座を見つけると図鑑に伝承が載り、その神の祠が地図に印される。7 日ごとの「七つ星の並び」を観測すると天界に星の宝箱。夜や並びの夜まで待つボタンがあり、長く待たなくてよい。"],
    ["歴史ディメンション（共通の仕組み）", "done", "村の外れの時の割れ目から入る別のゲーム。時代ごとにジャンルと視点がちがう。中では外の時間が止まり、帰りの割れ目（Esc）でいつでも元の場所へ。負けても世界・セーブは変わらない。報酬は段階ごとに 1 回だけ。"],
    ["万里の長城（兵士増殖アクション）", "done", "自動で進む軍団を左右に動かし、青い門で増やし赤い門を避ける。落石・敵の隊・最後の砦。3 段階。"],
    ["古代エジプト（パン屋経営とピラミッド建設）", "done", "麦 → 粉 → 生地 → パン → 売る／届ける。届けたパンの分だけピラミッドが高くなる。人を雇うと自動で働く。3 段階。"],
    ["冒険の博物館", "done", "始まりの村に建つ。アーティファクトの展示台 21 台、ボス・三界・歴史の模型、七柱の宝珠、固有武器、魔物の模型の棚、冒険の記録。"],
    ["クラフト", "done", "クイッククラフト: 作れる物が先頭・検索・分類・お気に入り・1 回／10 回／最大。足りない板や棒も材料があれば自動で先に作る（全部作れるときだけ所持品を変える）。作業台・金床を右クリックで直接開く。マイクラ式のマス目（手元 2×2・作業台と金床 3×3・炉）もそのまま。"],
    ["テイム・騎乗", "done", "動物に好物をあげて仲良くなり、乗る。地獄の恐竜はえさでテイムし、T キーで村の飼育場へ。"],
    ["七属性", "done", "炎・水・氷・雷・緑・土・風。属性の技（X）で雪を溶かす・水を凍らせる・岩を砕くなど。魔物との相性あり。"],
    ["次元の割れ目", "done", "始まりの村の外れの割れ目に加えて、世界じゅうに天界への割れ目 約 30・地獄 約 30・冥界 5。遠くからは光の柱、近づくと地図に印。帰還の割れ目で入った所へ戻る。"],
    ["滑空", "done", "落ちている途中で Space を押すと翼布が開く。W で前、Ctrl で速く、Space か Shift でたたむ。"],
    ["村の発展", "done", "家を建てると住人が越してくる。満足度・倉庫・建物の依頼。8 つの段階で小さな村から「伝説の都」へ（商店・城壁・大聖堂・宮殿・大使館・大駅…）。そのあとも繁栄が上がり町が広がる。"],
    ["四季と気候帯", "done", "7 日ごとに春・夏・秋・冬（変わり目は 2 日）。新緑・深緑・紅葉と落ち葉・落葉。高温・温暖・冷涼・寒冷の気候帯、積雪と吹雪。"],
    ["斜面・自然な木・植林", "done", "1 段の段差はなめらかな斜面で歩いて登れる。木は丸い幹と葉のかたまりで、苗木 → 若木 → 成木、2×2 で巨木。切る回数と原木・苗木の数は木の大きさで決まる。"],
    ["雪山の朝日と展望地点", "done", "太陽の影・光の筋・谷の朝霧・遠くの霞。雪の山頂 4 か所の展望地点。"],
    ["街道の旅人と伝令騎士", "done", "道の長さに合わせた旅人・冒険者・2 人連れ。昼に歩き夜は休む。8 都市の伝令騎士が馬で書状を届ける。"],
    ["柵・牧場", "done", "柵は自動でつながり、高さ 1.5 で動物が出られない。柵の門。右ボタンを押したまま動かすと続けて置ける。"],
    ["ベッド・眠る・夢", "done", "2 マスのベッド（4 方向）。眠る画面（朝まで・1/3/6 時間・夢の記録）。ふだんの夢・予知夢・特別な夢と、短い間歩ける夢の庭。"],
    ["LAN で一緒に", "wip", "同じネットワークの友だちと同じ世界を遊べる（同じ PC の 2 つの起動で確認。2 台の PC では未検証）。同行の仲間や派遣の姿はほかの人にはまだ見えない。"],
    ["3D のキャラクター", "wip", "仲間 12 人と町の人（7 種 × 体型 2）は Blender で作った 3D モデルと動き。魔物・動物はセル調と輪郭線で、専用モデルはひつじなど一部（ほかは開発中）。設定で従来のモデルに戻せる。"],
    ["仲間の掛け合い・表情", "done", "決まった 2 人がパーティにいると歩きながら話す。Lv が上がると喜び、攻撃を受けると痛がる。"],
    ["祠の試練・二つの属性の封印", "done", "祠の結晶は神と同じ属性の技で解ける（伝承の欠片）。水底の神殿の封印は炎と氷の技を 10 秒のうちに。"],
    ["野営のたき火", "done", "「野営の道具」でたき火を起こすと、仲間が囲んで座って休む（HP・MP がゆっくり戻る）。"],
    ["宝の地図の断片", "done", "探索の得意な仲間ではじめての宝箱を調べると断片が見つかることも。4 枚で宝の場所に印。"],
    ["ふるさと・誕生日・祭りの衣装", "done", "仲間のふるさとで歓迎と割引き、誕生日の贈り物、星灯り祭りに季節の衣装で贈り物。"],
    ["属性で人助け", "done", "雪道の救助（炎）・ミノリアの風車（風）・釣りの名人（水）。騎乗盗賊と恐竜の連携（X で魔獣の特技）。"],
    ["隠し宝物庫・写真モード・LAN の連携・模範試合・仲間の家", "idea", "まだ作っていない案（構想）。"],
  ];
  $("#sysGrid").innerHTML = sys.map(([n, s, t]) => `<article class="card" data-k="${esc(n + t)}"><h3>${esc(n)} ${badge(s)}</h3><p>${esc(t)}</p></article>`).join("");

  // ======== 完全攻略版（guide.html）だけの章: 実際の位置の地図・場所の一覧・隠し要素・ボス攻略 ========
  const FULL = document.body.dataset.mode === "full";
  const A = C.atlas || {}, P = window.PLACES || {};
  const RG = A.regions || { hellTop: 47, heavenBottom: 194, nether: [560, 46, 560, 744, 76, 744] };
  // 地域: 冥界の箱の中・地獄（hellTop より下）・天界（雲の上。地上でいちばん高い頂は 205 なので、それより上）・地上
  const regionOf = p => {
    if (!p) return "";
    const [x, y, z] = p, n = RG.nether;
    if (n && x >= n[0] && x <= n[3] && y >= n[1] && y <= n[4] && z >= n[2] && z <= n[5]) return "nether";
    if (y < RG.hellTop) return "hell";
    if (y >= RG.heavenBottom + 14) return "heaven";
    return "surface";
  };
  const pos = p => p ? `(${p[0]}, ${Number.isFinite(p[1]) ? p[1] : "—"}, ${p[2]})` : "—";
  const placeKinds = {
    city: ["都市", "#b8872a"], stop: ["宿場", "#8a6a3a"], warp: ["ワープの石", "#3a7bd5"], boss: ["ボス", "#c0392b"], camp: ["魔物の拠点", "#d35400"],
    portal: ["門", "#8e44ad"], chest: ["宝箱", "#e1b12c"], landmark: ["名所・ダンジョン", "#27ae60"], lore: ["伝承の石碑", "#7f8c8d"],
    shrine: ["祠", "#16a085"], trial: ["祠の試練の結晶", "#1abc9c"], rift: ["次元の割れ目", "#2980b9"], time: ["時の割れ目", "#d4a017"], secret: ["隠し要素", "#e84393"],
  };
  const places = [];
  const addPlace = (kind, name, p, note = "", link = "") => { if (p) places.push({ kind, name, p: p.map(v => Math.round(v)), note, link, region: regionOf(p) }); };
  if (FULL) {
    (W.cities || []).forEach(c => addPlace("city", c.name, [c.x, c.y, c.z], c.title || "", `#place-${c.id}`));
    (W.stops || []).forEach(s => addPlace("stop", s.name, [s.x, NaN, s.z], "街道の宿場（高さはその場の地面）"));
    (A.warps || []).forEach(w => addPlace("warp", w.name, w.pos, "ワープの石"));
    (C.bosses || []).forEach(b => (b.sites || []).forEach(s => addPlace("boss", `${b.name}（${s.name}）`, s.pos, s.chance < 1 ? `現れる確率 ${Math.round(s.chance * 100)}%` : "", `#boss-${b.id}`)));
    (A.enemySites || []).forEach(s => addPlace("camp", s.name, s.pos, (s.enemies || []).map(e => e.name).join("・") + `（最大 ${s.max} 体）`));
    (A.portals || []).forEach(s => addPlace("portal", s.name, s.pos, `→ ${s.to}`));
    (A.chests || []).forEach(s => addPlace("chest", s.name, s.pos, (s.items || []).map(i => `${i.name}×${i.count}`).join("・")));
    (A.landmarks || []).filter(l => !["village", "inn", "stable", "hamlet"].includes(l.kind)).forEach(l => addPlace("landmark", l.name, l.pos, l.kind));
    (A.lore || []).forEach(l => addPlace("lore", `伝承の石碑（${l.id}）`, l.pos, "読むと記録帳に"));
    (P.shrines || []).forEach(s => { addPlace("shrine", `${s.name}（${god(s.god).name}）`, s.pos, `${god(s.god).elementName}の加護`, `#god-${s.god}`); if (s.trial) addPlace("trial", `${s.name}の結晶`, s.trial, `${god(s.god).elementName}の仲間の技（X）で解ける`); });
    (P.rifts || []).forEach(r => addPlace("rift", r.name, r.pos, r.isReturn ? "地上へ戻る" : regionName(r.realm) + "へ"));
    if (P.timeRift) addPlace("time", "時の割れ目（歴史ディメンション）", P.timeRift, "触れると時代と仲間を選ぶ", "#history");
    if (P.starChest) addPlace("secret", "星の宝箱", P.starChest, "七つ星の並びを観測すると現れる", "#hidden-star");
    if (P.twinSeal) addPlace("secret", "二つの属性の封印", P.twinSeal, "炎と氷の技を 10 秒のうちに", "#hidden-twin");
    if (P.windmill) addPlace("secret", "ミノリアの風車", P.windmill, "風の仲間の技で回す");
  }
  if (FULL && $("#mapView")) {
    const regionBtns = [["surface", "地上"], ["heaven", "天界"], ["nether", "冥界"], ["hell", "地獄"], ["all", "すべて"]];
    let mapRegion = "surface";
    const kindOn = Object.fromEntries(Object.keys(placeKinds).map(k => [k, !["chest", "landmark", "lore"].includes(k)]));
    const roads = (W.roads || []).map(r => `<polyline points="${r.map(([x, z]) => `${x},${z}`).join(" ")}" fill="none" stroke="var(--line)" stroke-width="5"/>`).join("");
    function drawMap() {
      const vis = places.filter(pl => kindOn[pl.kind] && (mapRegion === "all" || pl.region === mapRegion));
      $("#mapView").innerHTML = `<svg viewBox="0 0 2048 2048" role="img" aria-label="世界の地図"><rect width="2048" height="2048" fill="var(--bg2)"/>${mapRegion === "surface" || mapRegion === "all" ? roads : ""}
        ${vis.map(pl => `<a href="#pl-${places.indexOf(pl)}"><circle cx="${pl.p[0]}" cy="${pl.p[2]}" r="${pl.kind === "city" ? 30 : 18}" fill="${placeKinds[pl.kind][1]}" stroke="var(--paper)" stroke-width="4"><title>${esc(pl.name)} ${pos(pl.p)} ${esc(pl.note)}</title></circle></a>`).join("")}
        ${vis.filter(pl => pl.kind === "city").map(pl => `<text x="${pl.p[0]}" y="${pl.p[2] - 34}" text-anchor="middle" font-size="44" fill="var(--ink)">${esc(pl.name)}</text>`).join("")}
        <text x="20" y="60" font-size="48" fill="var(--muted)">北 ↑（x 右へ・z 下へ）</text></svg>`;
      $("#placeCount").textContent = `${vis.length} か所`;
      document.querySelectorAll("#placeTable tr[data-i]").forEach(tr => { const pl = places[+tr.dataset.i]; tr.classList.toggle("hidden", !(kindOn[pl.kind] && (mapRegion === "all" || pl.region === mapRegion))); });
    }
    $("#mapRegion").innerHTML = regionBtns.map(([k, n]) => `<button type="button" data-v="${k}" class="${k === mapRegion ? "on" : ""}">${n}</button>`).join("");
    $("#mapRegion").addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b) return; mapRegion = b.dataset.v; $("#mapRegion").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); drawMap(); });
    $("#mapKinds").innerHTML = Object.entries(placeKinds).map(([k, [n, c]]) => `<label class="chip"><input type="checkbox" data-k="${k}" ${kindOn[k] ? "checked" : ""}> <span class="el" style="--c:${c}"></span>${n}</label>`).join("");
    $("#mapKinds").addEventListener("change", ev => { const k = ev.target.dataset.k; if (k) { kindOn[k] = ev.target.checked; drawMap(); } });
    $("#placeTable").innerHTML = `<tr><th>名前</th><th>種類</th><th>地域</th><th>座標 (x, y, z)</th><th>メモ</th></tr>` + places.map((pl, i) => `<tr id="pl-${i}" data-i="${i}"><td>${pl.link ? `<a href="${pl.link}">${esc(pl.name)}</a>` : esc(pl.name)}</td><td><span class="el" style="--c:${placeKinds[pl.kind][1]}"></span>${placeKinds[pl.kind][0]}</td><td>${regionName(pl.region)}</td><td>${pos(pl.p)}</td><td>${esc(pl.note)}</td></tr>`).join("");
    $("#placesGen").textContent = P.generated ? `祠・割れ目などの位置: ゲームから書き出し ${P.generated}（--guidetest）` : "祠・割れ目などの位置: まだ書き出していません（--guidetest）";
    drawMap();
  }
  if (FULL && $("#hiddenGrid")) {
    const al = (C.sky || {}).alignment || {};
    const chestGroups = {};
    (A.chests || []).forEach(c => (chestGroups[c.name] = chestGroups[c.name] || []).push(c));
    let hh = `<article class="card" id="hidden-star" data-k="星の宝箱 七つ星の並び 天文台" data-region="heaven"><h3>星の宝箱 ${badge("done")}</h3>
      <dl><dt>条件</dt><dd>天文台の望遠鏡で「${esc(al.name)}」（${al.everyDays} 日ごとの夜・南の低い空）を観測する</dd><dt>場所</dt><dd>天界・神々の城のそば ${pos(P.starChest)}</dd>
      <dt>中身</dt><dd>コイン ${(al.reward || {}).coins}・星のかけら ×${(al.reward || {}).count}（受取箱へ・1 回だけ）</dd></dl></article>`;
    hh += `<article class="card" id="hidden-twin" data-k="二つの属性の封印 炎 氷 水底の神殿" data-el="fire"><h3>二つの属性の封印 ${badge("done")}</h3>
      <dl><dt>場所</dt><dd>水底の神殿の鍵の間のそば ${pos(P.twinSeal)}</dd><dt>解き方</dt><dd>炎と氷の仲間の技（X）を 10 秒のうちに両方当てる（パーティに炎と氷の仲間を入れて、R で操作を切り替える）</dd><dt>ごほうび</dt><dd>★4 のオーブ（受取箱へ）</dd></dl></article>`;
    hh += `<article class="card" id="hidden-trials" data-k="祠の試練 結晶 伝承の欠片"><h3>祠の試練の結晶（11 か所） ${badge("done")}</h3><p>祠のそばの封じられた結晶は、まつる神と同じ属性の仲間の技でだけ解ける。ごほうびは伝承の欠片とオーブの欠片 3。</p>
      <table class="mini">${(P.shrines || []).map(s => `<tr><td><span class="el" style="--c:${rgb(god(s.god).color)}"></span>${esc(s.name)}</td><td>${esc(god(s.god).elementName)}</td><td>${pos(s.trial)}</td></tr>`).join("")}</table></article>`;
    hh += `<article class="card" data-k="宝の地図 断片"><h3>宝の地図の断片 ${badge("done")}</h3><p>探索の得意な仲間で、はじめての宝箱・チェストを開けると断片が見つかることがある。4 枚そろうと、まだ掘り当てていない宝の場所に地図（M）の印が付く。</p></article>`;
    hh += `<article class="card" data-k="図鑑の完成 称号"><h3>図鑑の完成のごほうび ${badge("done")}</h3><p>E のメニューの図鑑で、分類ごとに全部そろえると称号とコイン 300（受取箱）。</p>
      <dl><dt>キャラクター</dt><dd>仲間を集めし者</dd><dt>魔物</dt><dd>魔物博士</dd><dt>動物</dt><dd>動物となかよし</dd><dt>七柱の神々</dt><dd>七柱に見守られし者</dd><dt>11 の祠</dt><dd>祠めぐりの達人</dd><dt>アーティファクト</dt><dd>秘宝の収集家</dd></dl></article>`;
    hh += `<article class="card" data-k="七柱巡礼 七彩の巡礼衣 称号"><h3>七柱巡礼 ${badge("done")}</h3><p>1 人の仲間で七柱すべての祠で祈ると、称号「七柱の巡礼者」と限定衣装「七彩の巡礼衣」。</p></article>`;
    hh += (C.history || []).map(d => `<article class="card" data-k="${esc(d.name)} 称号 ${esc(d.title)}"><h3>${esc(d.name)}の称号 ${badge(d.status === "implemented" ? "done" : "wip")}</h3><p>最後の段階「${esc((d.stages || []).slice(-1)[0]?.name || "")}」をクリアすると、称号「${esc(d.title)}」と博物館の「${esc(d.name)}」の模型。<a href="#history-${esc(d.id)}">遊び方と道のり</a></p></article>`).join("");
    hh += Object.entries(chestGroups).map(([name, list]) => {
      const items = {}; list.forEach(c => (c.items || []).forEach(i => items[i.name] = (items[i.name] || 0) + i.count));
      const rg = regionOf(list[0].pos);
      return `<article class="card" data-k="${esc(name)} 宝箱 ${Object.keys(items).join(" ")}" data-region="${rg}"><h3>${esc(name)} <span class="sub">${list.length} 個・${regionName(rg)}</span> ${badge("done")}</h3>
        <dl><dt>中身（合計）</dt><dd>${Object.entries(items).map(([n, c]) => `<span class="chip">${esc(n)} ×${c}</span>`).join("")}</dd><dt>場所</dt><dd>${list.map(c => pos(c.pos)).join(" ")}</dd></dl></article>`;
    }).join("");
    $("#hiddenGrid").innerHTML = hh;
  }
  if (FULL && $("#bossGuideGrid")) {
    $("#bossGuideGrid").innerHTML = (C.bosses || []).map(b => {
      const mb = ((C.museum || {}).bosses || {})[b.id] || {};
      const atk = [["体当たり", b.contact], ["突進", b.charge], ["たたきつけ", b.slam], ["光の玉", b.orb]].filter(([, v]) => v).map(([n, v]) => `${n} ${v}`).join("・");
      return `<article class="card" id="bossguide-${esc(b.id)}" data-k="${esc(b.name + (mb.where || "") + (mb.story || ""))}" data-diff="hard" data-region="${regionOf((b.sites || [])[0]?.pos) || "surface"}"><h3>${esc(b.name)} ${badge("done")}</h3>
        <dl><dt>HP</dt><dd>${b.hp}</dd><dt>攻撃</dt><dd>${atk || "—"}</dd>
        ${(b.phases || []).filter(x => x).length ? `<dt>形態が変わる</dt><dd>HP が ${(b.phases || []).filter(x => x).map(x => Math.round(x * 100) + "%").join("・")} を切ったとき</dd>` : ""}
        <dt>出会う場所</dt><dd>${esc(mb.where || "")}${(b.sites || []).map(s => `<br>${esc(s.name)} ${pos(s.pos)}${s.chance < 1 ? `（現れる確率 ${Math.round(s.chance * 100)}%）` : ""}`).join("")}</dd>
        <dt>落とす物</dt><dd>${(b.drops || []).map(d => itemLink(d.key, d.name)).join("")}${b.coins ? `・コイン ${b.coins}` : ""}</dd>
        <dt>伝承</dt><dd>${esc(mb.story || "")}</dd></dl></article>`;
    }).join("");
  }

  // ======== どちらの版にも: 地域・属性・むずかしさ・状態のしるしと絞り込み、目次、パンくず、版の切り替え ========
  const enemyById = Object.fromEntries((C.enemies || []).map(e => [e.id, e]));
  const diffOfHp = hp => hp <= 30 ? "easy" : hp <= 70 ? "normal" : "hard";
  document.querySelectorAll(".card").forEach(c => {
    const id = c.id || "";
    if (id.startsWith("mob-") && enemyById[id.slice(4)]) { const e = enemyById[id.slice(4)]; c.dataset.region = e.region === "overworld" ? "surface" : e.region; c.dataset.diff = diffOfHp(e.hp); }
    else if (id.startsWith("boss-")) { c.dataset.diff = "hard"; }
    else if (id.startsWith("hero-")) { const h = (H.heroes || []).find(x => x.id === id.slice(5)); if (h) c.dataset.el = h.element; }
    else if (id.startsWith("god-")) { c.dataset.el = id.slice(4); }
    else if (id.startsWith("realm-")) { c.dataset.region = id.slice(6); }
    else if (id.startsWith("place-")) { c.dataset.region = c.dataset.region || "surface"; }
    else if (/^history-.+-.+$/.test(id)) { const d = (C.history || []).find(x => id.startsWith(`history-${x.id}-`)); const i = d ? d.stages.findIndex(s => id === `history-${d.id}-${s.id}`) : -1; if (i >= 0) c.dataset.diff = ["easy", "normal", "hard"][Math.min(2, i)]; }
    const b = c.querySelector(".badge"); if (b) c.dataset.status = b.classList.contains("done") ? "done" : b.classList.contains("wip") ? "wip" : "idea";
  });
  // 実機でまだ確かめていないもの（未検証）: しるしを付ける
  const unverified = ["LAN で一緒に"];
  document.querySelectorAll(".card").forEach(c => { const h = c.querySelector("h3"); if (h && unverified.some(u => h.textContent.includes(u))) { h.insertAdjacentHTML("beforeend", ' <span class="badge unv">未検証</span>'); c.dataset.unv = "1"; } });
  const tags = { region: [["surface", "地上"], ["heaven", "天界"], ["nether", "冥界"], ["hell", "地獄"]], el: gods.map(g => [g.element, g.elementName]), diff: [["easy", "やさしい"], ["normal", "ふつう"], ["hard", "むずかしい"]], status: [["done", "実装済み"], ["wip", "開発中"], ["idea", "構想"]] };
  const tagNames = { region: "地域", el: "属性", diff: "むずかしさ", status: "状態" };
  const active = { region: "", el: "", diff: "", status: "" };
  if ($("#tagFilters")) {
    $("#tagFilters").innerHTML = Object.entries(tags).map(([k, list]) => `<div class="filters" data-tag="${k}"><span class="count">${tagNames[k]}:</span><button type="button" data-v="" class="on">すべて</button>${list.map(([v, n]) => `<button type="button" data-v="${v}">${esc(n)}</button>`).join("")}</div>`).join("");
    $("#tagFilters").addEventListener("click", ev => {
      const b = ev.target.closest("button"); if (!b) return;
      const bar = b.closest("[data-tag]"); active[bar.dataset.tag] = b.dataset.v;
      bar.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      document.querySelectorAll(".card").forEach(c => c.classList.toggle("hidden-g", Object.entries(active).some(([k, v]) => v && c.dataset[k] !== v)));
      apply();
    });
  }
  // 目次（章ごとの件数）とパンくず
  const sections = [...document.querySelectorAll("main section[id]")];
  function toc() { if ($("#toc")) $("#toc").innerHTML = sections.map(s => { const n = s.querySelectorAll(".card:not(.hidden)").length; return `<a class="chip" href="#${s.id}">${esc(s.querySelector("h2").textContent)}${n ? ` <span class="count">${n}</span>` : ""}</a>`; }).join(""); }
  const crumbBase = FULL ? `<a href="index.html">ホーム</a> › <a href="guide.html">完全攻略版</a>` : `<a href="index.html">ホーム</a> › <a href="codex.html">攻略図鑑（通常版）</a>`;
  function crumb(sec) { if ($("#crumbs")) $("#crumbs").innerHTML = crumbBase + (sec ? ` › <a href="#${sec.id}">${esc(sec.querySelector("h2").textContent)}</a>` : ""); }
  crumb(null);
  if ("IntersectionObserver" in window) { const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) crumb(e.target); }), { rootMargin: "-40% 0px -55% 0px" }); sections.forEach(s => io.observe(s)); }
  // 版の切り替え
  if ($("#verBtn")) { $("#verBtn").textContent = FULL ? "通常版へ" : "完全攻略版（ネタバレ）へ"; $("#verBtn").href = FULL ? "codex.html" : "guide.html"; }
  // 完全攻略版: 入口でネタバレの確認（このタブで一度だけ）。中はぼかさない
  if (FULL) {
    document.body.classList.add("spoil");
    let ok = false; try { ok = sessionStorage.getItem("guide-ok") === "1"; } catch (e) { }
    const gate = $("#spoilGate");
    if (gate && !ok) { gate.classList.remove("hidden"); document.body.classList.add("gated"); }
    if ($("#gateYes")) $("#gateYes").addEventListener("click", () => { try { sessionStorage.setItem("guide-ok", "1"); } catch (e) { } gate.classList.add("hidden"); document.body.classList.remove("gated"); });
  }
  // ---- 絞り込み・検索・ネタバレ・昼夜 ----
  function filters(bar, grid, list) {
    const el = $(bar);
    el.innerHTML = list.map(([k, n], i) => `<button type="button" data-v="${k}" class="${i === 0 ? "on" : ""}">${n}</button>`).join("");
    el.addEventListener("click", ev => {
      const b = ev.target.closest("button"); if (!b) return;
      el.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      $(grid).querySelectorAll(".card").forEach(c => c.classList.toggle("hidden-f", b.dataset.v !== "all" && c.dataset.f !== b.dataset.v));
      apply();
    });
  }
  const q = $("#q");
  function apply() {
    const s = q.value.trim().toLowerCase();
    let n = 0;
    document.querySelectorAll(".card").forEach(c => {
      const hit = !s || (c.dataset.k || c.textContent).toLowerCase().includes(s) || c.textContent.toLowerCase().includes(s);
      const show = hit && !c.classList.contains("hidden-f") && !c.classList.contains("hidden-g");
      c.classList.toggle("hidden", !show);
      if (show && s) n++;
    });
    $("#hits").textContent = s ? `「${q.value}」: ${n} 件` : "";
    if (FULL) document.querySelectorAll("#placeTable tr[data-i]").forEach(tr => tr.classList.toggle("hidden-s", !!s && !tr.textContent.toLowerCase().includes(s)));
    toc();
  }
  q.addEventListener("input", apply);
  document.addEventListener("click", ev => { const sp = ev.target.closest(".spoiler"); if (sp && !document.body.classList.contains("spoil")) { sp.classList.add("open"); ev.preventDefault(); } });
  const spoilBtn = $("#spoilBtn");
  if (FULL && spoilBtn) spoilBtn.classList.add("hidden");
  spoilBtn.addEventListener("click", () => { const on = document.body.classList.toggle("spoil"); spoilBtn.setAttribute("aria-pressed", on); spoilBtn.textContent = on ? "ネタバレを隠す" : "ネタバレを表示"; });
  const timeBtn = $("#timeBtn");
  function setTime(t) { document.documentElement.dataset.time = t; timeBtn.textContent = t === "day" ? "夜" : "昼"; try { localStorage.setItem("codex-time", t); } catch (e) { } }
  let saved = null; try { saved = localStorage.getItem("codex-time"); } catch (e) { }
  setTime(saved || (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day"));
  timeBtn.addEventListener("click", () => setTime(document.documentElement.dataset.time === "day" ? "night" : "day"));
  const style = document.createElement("style"); style.textContent = ".hidden-f,.hidden-g,.hidden-s{display:none!important}"; document.head.appendChild(style);
  toc();
})();
