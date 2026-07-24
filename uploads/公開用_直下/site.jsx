const { useState, useEffect, useRef } = React;

// ===== Tweak defaults (persisted by host) =====
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "night",
  "accent": "#B89968",
  "displayFont": "Italiana",
  "showMoon": true,
  "showSideWord": true,
  "showPromo": true
} /*EDITMODE-END*/;

// ===== Tiny utilities =====
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;if (!el) return;
    const nodes = el.querySelectorAll('.fade');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {if (e.isIntersecting) {e.target.classList.add('in');obs.unobserve(e.target);}});
    }, { threshold: 0.12 });
    nodes.forEach((n) => obs.observe(n));
    const fallback = setTimeout(() => nodes.forEach((n) => n.classList.add('in')), 1600);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);
  return ref;
}

// ===== Header =====
const NAV_ITEMS = [
  { href: '#/concept', en: 'Concept', jp: 'コンセプト' },
  { href: '#/banquet', en: 'Banquet', jp: '会場' },
  { href: '#/ceremony', en: 'Ceremony', jp: '挙式' },
  { href: '#/cuisine', en: 'Cuisine', jp: 'お料理' },
  { href: '#/dresses', en: 'Dress', jp: 'ドレス' },
  { href: '#/day', en: 'A Day', jp: '当日の流れ' },
  { href: '#/gallery', en: 'Gallery', jp: 'ギャラリー' },
  { href: '#/faq', en: 'F&Q', jp: 'よくある質問' },
  { href: '#/fair', en: 'Fair', jp: 'フェア' }];

function Header({ tweaks }) {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    document.body.classList.toggle('menu-is-open', menuOpen);
    return () => { document.body.style.overflow = ''; document.body.classList.remove('menu-is-open'); };
  }, [menuOpen]);
  return (
    <React.Fragment>
    <nav className={`nav${solid ? ' solid' : ''}${menuOpen ? ' menu-open' : ''}`}>
      <a className="brand" href="#/" aria-label="Home">
        <div className="b1">T'SUKI</div>
        <div className="b2">SUR&nbsp;LA&nbsp;MER</div>
      </a>
      <div className="nav-links">
        {NAV_ITEMS.map((n) => <a key={n.href} href={n.href}>{n.en}</a>)}
      </div>
      <div className="nav-cta">
      </div>
      <button
        className={`nav-burger${menuOpen ? ' open' : ''}`}
        aria-label="メニュー"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}>
        <span /><span /><span />
      </button>
    </nav>

    <div className={`mobile-menu${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
      <div className="mm-inner">
        <nav className="mm-links">
          {NAV_ITEMS.map((n, i) =>
            <a key={n.href} href={n.href} style={{ transitionDelay: (0.05 + i * 0.04) + 's' }}
               onClick={() => setMenuOpen(false)}>
              <span className="mm-en">{n.en}</span>
            </a>)}
        </nav>
        <div className="mm-foot">
          <a href="Reservation.html" className="mm-pill" onClick={() => setMenuOpen(false)}>Reservation</a>
        </div>
      </div>
    </div>
    </React.Fragment>);

}

// ===== Hero =====
function Stars() {
  // deterministic seeded layout so SSR-ish looks consistent across renders
  const arr = [];
  let seed = 7;
  const rand = () => {seed = (seed * 9301 + 49297) % 233280;return seed / 233280;};
  for (let i = 0; i < 80; i++) {
    arr.push({
      left: rand() * 100,
      top: rand() * 70,
      lg: rand() > 0.85
    });
  }
  return (
    <div className="hero-stars">
      {arr.map((s, i) =>
      <span key={i} className={"star" + (s.lg ? " lg" : "")}
      style={{ left: s.left + "%", top: s.top + "%" }} />
      )}
    </div>);

}

function Hero() {
  const videoRef = useRef(null);
  // PCは横長 hero.mp4 / スマホは縦長 hero-mobile.mp4 を出し分け（読み込みは片方のみ）
  const [src, setSrc] = useState('assets/hero.mp4');
  useEffect(() => {
    try {
      if (window.matchMedia('(max-width: 980px)').matches) setSrc('assets/hero-mobile.mp4');
    } catch (e) {}
  }, []);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    tryPlay();
    // iOS Safari sometimes needs a nudge after metadata / first interaction
    v.addEventListener('loadeddata', tryPlay);
    v.addEventListener('canplay', tryPlay);
    const onTouch = () => { tryPlay(); };
    document.addEventListener('touchstart', onTouch, { once: true, passive: true });
    document.addEventListener('click', onTouch, { once: true });
    // retry when returning to the tab
    const onVis = () => { if (!document.hidden) tryPlay(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      v.removeEventListener('loadeddata', tryPlay);
      v.removeEventListener('canplay', tryPlay);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return (
    <header className="hero">
      <div className="hero-bg" />
      <video
        ref={videoRef}
        key={src}
        className="hero-video"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto" />
      <div className="hero-mcap">
        <div className="hero-mcap-eyebrow">Tokyo Bayfront Wedding</div>
        <div className="hero-mcap-brand">T'SUKI<span>sur la mer</span></div>
        <div className="hero-mcap-sub">おもてなしは「東京」という街のエレガンス</div>
      </div>
      <div className="scroll-cue"><span>Scroll</span><span className="line" /></div>
    </header>);

}

// ===== Concept =====
const CONCEPT_FEATURES = [
{ no: '01',
  title: '東京らしさとリゾート感が両立する特別なロケーションを独占',
  body: 'レインボーブリッジと空、海が目の前だからこそ体感できる他では得られないような臨場感でゲストをもてなせば、この感動ごと思い出深い1日に。テラスに出れば潮風も感じられ抜群の開放感。煌めく夜景も生涯の宝物に。',
  img: 'assets/banquet.jpg' },
{ no: '02',
  title: 'フランスのエスプリと四季を閉じ込めた「小宇宙」のテリーヌ',
  body: 'グループ統括料理長はミシュランで15年連続星を獲った姉妹店「レザンファン ギャテ」松澤直紀氏。多彩な食材を芸術的に重ねる至高のテリーヌは、調和と創造性が断面と味に表現され、一期一会のふたりの出会いのよう。',
  img: 'assets/concept-02.jpg' },
{ no: '03',
  title: 'レッドカーペットが高級感を醸成する邸宅で挙式〜披露宴まで満喫',
  body: '知る人ぞ知る海辺の有名レストランでありながら、館内には自然光が溢れるチャペルも。パーティではきらめく東京湾の水面とレインボーブリッジのワイドビューが圧倒的なスケールでゲストを魅了し、寛ぎのひと時を演出。',
  img: 'assets/concept-03.jpg' }];


function Concept() {
  const ref = useFadeIn();
  const panoRef = useRef(null);
  useEffect(() => {
    const el = panoRef.current;
    if (!el) return;
    let dragging = false, sx = 0, sy = 0, pos = 50, startPos = 50, axis = '';
    el.style.backgroundPosition = pos + '% center';
    el.style.backgroundSize = 'cover';
    const gx = (e) => e.touches ? e.touches[0].clientX : e.clientX;
    const gy = (e) => e.touches ? e.touches[0].clientY : e.clientY;
    const down = (e) => { dragging = true; axis = ''; sx = gx(e); sy = gy(e); startPos = pos; el.classList.add('grabbing'); };
    const move = (e) => {
      if (!dragging) return;
      const dx = gx(e) - sx, dy = gy(e) - sy;
      if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (axis === 'y') { dragging = false; return; }
      if (axis === 'x') {
        pos = Math.max(0, Math.min(100, startPos - dx / el.clientWidth * 120));
        el.style.backgroundPosition = pos + '% center';
        el.classList.add('touched');
        if (e.cancelable) e.preventDefault();
      }
    };
    const up = () => { dragging = false; el.classList.remove('grabbing'); };
    el.addEventListener('pointerdown', down);
    el.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('touchend', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('touchstart', down); window.removeEventListener('pointermove', move); window.removeEventListener('touchmove', move); window.removeEventListener('pointerup', up); window.removeEventListener('touchend', up); };
  }, []);
  return (
    <section id="concept" className="concept-page" ref={ref}>
      <div className="cp-pagetitle fade">CONCEPT</div>
      <div className="cp-tophero cp-pano" ref={panoRef} style={{ backgroundImage: "url('assets/concept-kv.jpg')" }}>
        <div className="cp-pano-hint" aria-hidden="true"><span className="l">←</span>swipe<span className="r">→</span></div>
      </div>
      <div className="cp-statement">
        <h2 className="cp-title fade">おもてなしは<br />「東京」という街のエレガンス</h2>
      </div>

      <div className="cp-lead-block fade">
        <h3 className="cp-lead-head">すべてが語り合う理由になる場所</h3>
        <div className="cp-lead-body">
          <p>ツキシュールラメールを満たしている空気は、<br />「東京」という街のエレガンス。<br />イルミネーションきらめく夜景、青空に映えるレインボーブリッジ、海上を行き交う客船…<br />そんな東京の絶景を眺めていると、流れる音楽も、運ばれる一皿も、<br />恋人のおめかしも、五感で感じるすべてが語り合いたくなる理由になってしまう。<br />誰もが自然と洗練された気分になってしまう。</p>
          <p>私たちがご用意しているのは、そんなひとときです。</p>
          <p>大切な皆さまへ、「東京」という街のエレガンスを贈ること。<br />それが、ツキシュールラメールで叶う最高のおもてなしです。</p>
        </div>
      </div>

      <div className="cp-features">
        {CONCEPT_FEATURES.map((f) =>
        <article key={f.no} className="cp-feat fade">
          <div className="cp-feat-head"><span className="cp-feat-no">{f.no}</span><h4 className="cp-feat-title">{f.title}</h4></div>
          <div className="cp-feat-photo" style={{ backgroundImage: `url('${f.img}')` }} />
          <p className="cp-feat-body">{f.body}</p>
        </article>
        )}
      </div>

      <div className="cp-message fade">
        <h3 className="cp-msg-en">Message</h3>
        <h2 className="cp-msg-head">すべては<br />「あなたに会えてよかった」のために</h2>
        <div className="cp-msg-body">
          <p>私たちが考える結婚式の本質は、<br />ゲストの皆さまが「このふたりの家族・友人で良かった」と思える時間を過ごすこと。<br />そのために必要なことは、カップルの数だけ違います。</p>
          <p>だから私たちがご用意するのは、「東京」を額縁に収めたような絶景と美食、それだけ。<br />それをシンプルなキャンバスにして、ふたりにとって意味のあるものだけを書き足していきましょう。</p>
          <p>「みんなと同じ」でなくていい。自然体な過ごし方も洗練された過ごし方も、<br />穏やかな語らいも弾けるような笑い声も、どれも正解です。</p>
          <p>「出会えた幸せ」が、集まるすべての人に溢れだす、そんな時間を一緒に紡ぎませんか？</p>
        </div>
      </div>

      <div className="cp-links">
        <div className="cp-link fade">
          <h3 className="cp-link-en">Reservation</h3>
          <p className="cp-link-body">会場のご見学、お料理のご試食、ドレスのご案内まで、おふたりのペースでご検討いただけます。</p>
          <a className="cp-link-btn" href="Reservation.html">Reservation</a>
        </div>
        <div className="cp-link fade d1">
          <h3 className="cp-link-en">Online store</h3>
          <p className="cp-link-body">ギフトやご記念の品を、オンラインショップにてお求めいただけます。ツキシュールラメールの世界観をご自宅でもお楽しみください。</p>
          <a className="cp-link-btn" href="https://cordy.jp/" target="_blank" rel="noopener">Online store</a>
        </div>
      </div>
    </section>);

}

// ===== Banquet =====
function Banquet() {
  const ref = useFadeIn();
  return (
    <section id="banquet" className="concept-page" ref={ref}>
      <div className="cp-statement">
        <h2 className="cp-title fade">「東京」を一望する<br />海辺の一軒家</h2>
      </div>
      <div className="cp-lead-block fade">
        <h3 className="cp-lead-head">リゾート気分で眺める大都会のパノラマ</h3>
        <div className="cp-lead-body">
          <p>都心の一等地にいながら、喧騒を忘れ、穏やかなプライベートタイムをお過ごしいただけます。<br />眺めているのは躍動する大都会のパノラマ。<br />それなのに、ここに流れているのは、リゾート地にいるようなリラックスした時間。</p>
          <p>そんな鮮やかなコントラストこそ、<br />訪れる人すべてをロマンチストにしてしまうエレガンスなのです。</p>
        </div>
      </div>

      <div className="cp-info-block fade">
        <h3 className="cp-section-label">Banquet Information<span>披露宴情報</span></h3>
        <dl className="cp-info">
          <div><dt>capacity</dt><dd>最大 110 名（着席）</dd></div>
          <div><dt>style</dt><dd>貸し切り型・一軒家レストラン</dd></div>
          <div><dt>terrace</dt><dd>潮風を感じるプライベートテラス付き</dd></div>
          <div><dt>view</dt><dd>東京湾・レインボーブリッジのパノラマビュー</dd></div>
        </dl>
      </div>

      <div className="cp-scroller fade">
        {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((n) =>
        <img key={n} className="cp-scroller-img" src={`assets/banquet-${n}.jpg`} alt="披露宴の様子" loading="lazy" />
        )}
      </div>

      <div className="cp-links">
        <div className="cp-link fade">
          <h3 className="cp-link-en">Reservation</h3>
          <p className="cp-link-body">会場のご見学、お料理のご試食、ドレスのご案内まで、おふたりのペースでご検討いただけます。</p>
          <a className="cp-link-btn" href="Reservation.html">Reservation</a>
        </div>
        <div className="cp-link fade d1">
          <h3 className="cp-link-en">Online store</h3>
          <p className="cp-link-body">ギフトやご記念の品を、オンラインショップにてお求めいただけます。ツキシュールラメールの世界観をご自宅でもお楽しみください。</p>
          <a className="cp-link-btn" href="https://cordy.jp/" target="_blank" rel="noopener">Online store</a>
        </div>
      </div>
    </section>);

}

// ===== Ceremony =====
const CEREMONIES = [
{ id: 'chapel', idx: '1', en: 'Chapel', jp: '凛として', img: 'assets/ceremony-chapel.jpg',
  head: 'ごく近しい人たちだけで凛とした誓い',
  desc: '家族や親友だけに見守られ、<br />一言ひとつの言葉の重みがまっすぐ伝わる距離感。<br />心の深いところで幸せを実感できる時間。',
  capLabel: 'capacity', capValue: '35 Guests',
  tag: 'Clear & Silent' },
{ id: 'banquet', idx: '2', en: 'Banquet', jp: '自然体', img: 'assets/ceremony-banquet.jpg',
  head: '頑張りすぎず、いつものトーンで',
  desc: 'パーティ会場での挙式は、リラックスした状態でゲストと一体になれるスタイル。１日中、ずっと和やかなテンションで過ごしたい人へ。',
  capLabel: 'capacity', capValue: '110 Guests',
  tag: 'Soft & Relax' },
{ id: 'shrine', idx: '3', en: 'Shrine', jp: '厳かに', img: 'assets/ceremony-shrine.jpg',
  head: '静と動のコントラストを楽しむ',
  desc: '厳かで静謐に包まれた神社挙式は開放感のあるパーティとのコントラストが抜群。メリハリのある１日に。',
  tag: 'Sacred & Classical' }];


function PhotoCarousel({ images, ratio }) {
  const [i, setI] = useState(0);
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const upd = () => setPerView(window.matchMedia('(max-width: 900px)').matches ? 1 : 3);
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);
  const maxI = Math.max(0, images.length - perView);
  const idx = Math.min(i, maxI);
  const go = (d) => setI((v) => Math.max(0, Math.min(maxI, v + d)));
  return (
    <div className="cer-carousel">
      <div className="cer-carousel-window">
        <div className="cer-carousel-track" style={{ transform: `translateX(calc(-${idx} * (100% / ${perView})))` }}>
          {images.map((src, k) =>
          <div key={k} className="cer-slide" style={{ flexBasis: `calc(100% / ${perView})` }}>
            <div className="cer-slide-img" style={{ backgroundImage: `url('${src}')`, aspectRatio: ratio || '3 / 4' }} />
          </div>
          )}
        </div>
      </div>
      <button className="cer-arrow prev" onClick={() => go(-1)} disabled={idx === 0} aria-label="前へ">‹</button>
      <button className="cer-arrow next" onClick={() => go(1)} disabled={idx === maxI} aria-label="次へ">›</button>
      <div className="cer-dots">
        {Array.from({ length: maxI + 1 }).map((_, k) =>
        <button key={k} className={"cer-dot" + (k === idx ? " on" : "")} onClick={() => setI(k)} aria-label={"slide " + (k + 1)} />
        )}
      </div>
    </div>);

}

function Ceremony() {
  const ref = useFadeIn();
  return (
    <section id="ceremony" className="concept-page" ref={ref}>
      <div className="cp-statement">
        <h2 className="cp-title fade">３つのスタイルから<br />選べる誓いの形</h2>
      </div>
      <div className="cp-lead-block fade">
        <h3 className="cp-lead-head">Three Vows.</h3>
        <div className="cp-lead-body">
          <p>挙式は３つのスタイルをご用意。<br />ふたりの感性、ゲストの顔ぶれに合わせて、しっくりくるスタイルをお選びいただけます。<br />それぞれ、教会式・人前式が選べます。</p>
        </div>
      </div>

      <div className="cer-features">
        {CEREMONIES.map((c, i) =>
        <div key={c.id} className={"cer-feature fade" + (i % 2 === 1 ? " flip" : "")}>
          {c.img ?
          <div className="cer-feature-img" style={{ backgroundImage: `url('${c.img}')` }} /> :
          <div className="cer-feature-img cer-feature-img--ph">PHOTO</div>}
          <div className="cer-feature-panel">
            <div className="cer-feature-tag">{c.en}｜{c.jp}</div>
            <h3 className="cer-feature-title">{c.head}</h3>
            <p className="cer-feature-desc" dangerouslySetInnerHTML={{ __html: c.desc }} />
            {c.capValue &&
            <div className="cer-feature-cap">capacity — {c.capValue}</div>}
          </div>
        </div>
        )}
      </div>

      <div className="cp-scroller fade">
        {['assets/ceremony-chapel.jpg','assets/ceremony-banquet.jpg','assets/ceremony-shrine.jpg','assets/day-ceremony.jpg','assets/photo-session.jpg','assets/rehearsal.jpg'].map((s) =>
        <img key={s} className="cp-scroller-img" src={s} alt="挙式の様子" loading="lazy" />
        )}
      </div>

      <div className="cp-links">
        <div className="cp-link fade">
          <h3 className="cp-link-en">Reservation</h3>
          <p className="cp-link-body">会場のご見学、お料理のご試食、ドレスのご案内まで、おふたりのペースでご検討いただけます。</p>
          <a className="cp-link-btn" href="Reservation.html">Reservation</a>
        </div>
        <div className="cp-link fade d1">
          <h3 className="cp-link-en">Online store</h3>
          <p className="cp-link-body">ギフトやご記念の品を、オンラインショップにてお求めいただけます。ツキシュールラメールの世界観をご自宅でもお楽しみください。</p>
          <a className="cp-link-btn" href="https://cordy.jp/" target="_blank" rel="noopener">Online store</a>
        </div>
      </div>
    </section>);

}

// ===== Cuisine =====
const CUISINE_SLIDES = [
{ src: 'assets/cuisine-1.jpg', label: 'Cold Entrée' },
{ src: 'assets/cuisine-2.jpg', label: 'Aperitif & Bloom' },
{ src: 'assets/cuisine-3.jpg', label: 'Plat Principal' },
{ src: 'assets/cuisine-4.jpg', label: 'Wedding Cake' },
{ src: 'assets/cuisine-5.jpg', label: 'Dessert' },
{ src: 'assets/cuisine-6.jpg', label: 'Cave à Vin' }];


const CUISINE_CUSTOM = [
'お肉料理のみグレードアップ',
'コース料理の１品をオリジナルに',
'フリードリンクにはない特別なワインを追加',
'サプライズデセールの演出'];


function Cuisine() {
  const ref = useFadeIn();
  return (
    <section id="cuisine" className="concept-page" ref={ref}>
      <div className="cp-statement">
        <h2 className="cp-title fade">記念日レストラン<br />ならではのご提案</h2>
      </div>
      <div className="cp-lead-block fade">
        <h3 className="cp-lead-head">The Anniversary Quality.</h3>
        <div className="cp-lead-body">
          <p>おすすめは、シェフ＆ソムリエと相談して決めるカスタマイズメニュー。<br />決まったコースはありますが、ゲストの顔ぶれや好みに応じたカスタマイズに応じます。<br />記念日レストランならではのご提案をお楽しみください。</p>
        </div>
      </div>

      <div className="cer-features">
        <div className="cer-feature fade">
          <div className="cer-feature-img" style={{ backgroundImage: "url('assets/cuisine-feature.jpg')" }} />
          <div className="cer-feature-panel">
            <div className="cer-feature-tag">Hospitality</div>
            <h3 className="cer-feature-title">25年の歴史が証明する<br />確かなサービスと美食。</h3>
            <p className="cer-feature-desc">積み重ねた信頼が、<br />最高のおもてなしを提供します。</p>
          </div>
        </div>
        <div className="cer-feature flip fade">
          <div className="cer-feature-img" style={{ backgroundImage: "url('assets/cuisine-feature-2.jpg')" }} />
          <div className="cer-feature-panel">
            <div className="cer-feature-tag">Spécialité</div>
            <h3 className="cer-feature-title">見た目も美しい、<br />スペシャリテの野菜のテリーヌ。</h3>
            <p className="cer-feature-desc">口に入れた瞬間、ゲストの歓声が上がる一皿です。</p>
          </div>
        </div>
        <div className="cer-feature fade">
          <div className="cer-feature-img" style={{ backgroundImage: "url('assets/cuisine-feature-3.jpg')" }} />
          <div className="cer-feature-panel">
            <div className="cer-feature-tag">Fusion</div>
            <h3 className="cer-feature-title">ミシュラン星付きフレンチのコースに、<br />職人の寿司が加わる。</h3>
            <p className="cer-feature-desc">ここだけの特別な美食の宴をお愉しみください。</p>
          </div>
        </div>
        <div className="cer-feature flip fade">
          <div className="cer-feature-img" style={{ backgroundImage: "url('assets/cuisine-feature-4.jpg')" }} />
          <div className="cer-feature-panel">
            <div className="cer-feature-tag">Pairing</div>
            <h3 className="cer-feature-title">一皿ごとに、<br />最高の一杯を。</h3>
            <p className="cer-feature-desc">料理に寄り添うペアリングが、ゲストの感動をさらに深めます。</p>
          </div>
        </div>
      </div>

      <div className="cp-scroller fade">
        {['assets/cuisine-01.jpg','assets/cuisine-02.jpg','assets/cuisine-03.jpg','assets/cuisine-04.jpg','assets/cuisine-05.jpg','assets/cuisine-06.jpg','assets/cuisine-07.jpg'].map((s) =>
        <img key={s} className="cp-scroller-img" src={s} alt="お料理" loading="lazy" />
        )}
      </div>

      <div className="cp-info-block fade">
        <h3 className="cp-section-label">Customize<span>カスタマイズ例</span></h3>
        <ol className="cui-custom">
          {CUISINE_CUSTOM.map((t, i) =>
          <li key={i}><span className="no">{String(i + 1).padStart(2, '0')}</span><span className="t">{t}</span></li>
          )}
        </ol>
        <p className="cp-note">全コースメニューで、<span className="accent">シェフ＆ソムリエ</span>へのご相談を承ります。</p>
      </div>

      <div className="cp-links">
        <div className="cp-link fade">
          <h3 className="cp-link-en">Reservation</h3>
          <p className="cp-link-body">会場のご見学、お料理のご試食、ドレスのご案内まで、おふたりのペースでご検討いただけます。</p>
          <a className="cp-link-btn" href="Reservation.html">Reservation</a>
        </div>
        <div className="cp-link fade d1">
          <h3 className="cp-link-en">Online store</h3>
          <p className="cp-link-body">ギフトやご記念の品を、オンラインショップにてお求めいただけます。ツキシュールラメールの世界観をご自宅でもお楽しみください。</p>
          <a className="cp-link-btn" href="https://cordy.jp/" target="_blank" rel="noopener">Online store</a>
        </div>
      </div>
    </section>);

}

// ===== Wedding Dresses =====
function Dresses() {
  const ref = useFadeIn();
  return (
    <section id="dresses" className="concept-page" ref={ref}>
      <div className="cp-statement">
        <h2 className="cp-title fade">まとうのは<br />「私だけの特別な意味」</h2>
      </div>
      <div className="cp-lead-block fade">
        <h3 className="cp-lead-head">Wear Your Story.</h3>
        <div className="cp-lead-body">
          <p>約120店舗、約5,000着の豊富なラインナップをご用意。<br />「華やか」「スタイリッシュ」「可憐」「ゴージャス」…<br />ゲストの皆さまが期待してくれる晴れ姿に思いを馳せ、あなただけの特別な意味をまとって。</p>
        </div>
      </div>

      <div className="dress-grid fade">
        {['01', '02', '03', '04', '05', '06', '07', '08', '09'].map((n) =>
        <img key={n} className="dress-grid-img" src={`assets/dress-${n}.avif`} alt="ウェディングドレス" loading="lazy" />
        )}
      </div>

      <div className="cp-links">
        <div className="cp-link fade">
          <h3 className="cp-link-en">Reservation</h3>
          <p className="cp-link-body">会場のご見学、お料理のご試食、ドレスのご案内まで、おふたりのペースでご検討いただけます。</p>
          <a className="cp-link-btn" href="Reservation.html">Reservation</a>
        </div>
        <div className="cp-link fade d1">
          <h3 className="cp-link-en">Online store</h3>
          <p className="cp-link-body">ギフトやご記念の品を、オンラインショップにてお求めいただけます。ツキシュールラメールの世界観をご自宅でもお楽しみください。</p>
          <a className="cp-link-btn" href="https://cordy.jp/" target="_blank" rel="noopener">Online store</a>
        </div>
      </div>
    </section>);

}

// ===== Timeline =====
const TIMELINE = [
{ t: '13:00', en: 'Preparation', jp: 'ご親族集合・ご新郎新婦お支度',
  accent: 'A View Awaits', note: '東京の絶景がお出迎え',
  img: 'assets/day-arrival.jpg' },
{ t: '14:30', en: 'Rehearsal', jp: 'リハーサル／ゲスト受付開始',
  accent: 'First & Family Meet', note: 'ファーストミートやファミリーミートも\nじっくり味わって',
  sideImg: 'assets/rehearsal.jpg' },
{ t: '15:00', en: 'Ceremony', jp: '挙式',
  accent: 'Three Vows', note: '「オープンに」「厳かに」「カジュアルに」。\n誓いの形も自分たちらしく',
  img: 'assets/day-ceremony.jpg' },
{ t: '15:30', en: 'Photo Session', jp: 'フォトセッション・ウェルカムドリンク',
  accent: 'Warm Welcome', note: 'おふたりから皆さまへ。お越しいただいたお礼を伝える温かい時間',
  sideImg: 'assets/photo-session.jpg' },
{ t: '16:00', en: 'The Stage Is Set', jp: '披露宴 開宴',
  accent: 'On Stage', note: 'さあ「絶景」という舞台へ。集まった全員がそれぞれの感性で祝福の時間に色を添えていく時間',
  img: 'assets/day-reception.jpg' },
{ t: '17:30', en: 'The Signature Moment', jp: 'ケーキセレモニー',
  accent: 'Highlight', note: 'この日のハイライトシーンの１つ。おふたりとゲストの記憶に残る大切なシーンも、心のままにプランニングしましょう',
  img: 'assets/day-cake.jpg' },
{ t: '18:30', en: 'The Eternal Ties', jp: 'お開き・お見送り',
  accent: 'A Future Begins', note: '「あなたに会えてよかった」。おふたりもゲストも温かい気持ちで満たされる時間。この幸せはふたりの未来を支えてくれるもの',
  img: 'assets/day-farewell.jpg' }];


function Timeline() {
  const ref = useFadeIn();
  return (
    <section id="day" className="timeline" ref={ref}>
      <div className="tl">
        {TIMELINE.map((row, i) => {
          const photoLeft = i % 2 === 0; // photo alternates: left, right, left...
          const textClass = photoLeft ? 'right' : 'left'; // text sits opposite the photo
          const photo = row.img || row.sideImg;
          const Photo =
          <div className="tl-aside"><div className="tl-aside-ph" style={{ backgroundImage: `url('${photo}')` }} /></div>;
          const Text =
          <>
              <div className="tl-time">{row.t}</div>
              <div className="tl-en">{row.en}</div>
              <div className="tl-jp">{row.jp}</div>
              <div className="tl-note">
                {row.note}
              </div>
            </>;

          return (
            <div key={row.t} className={`tl-row ${textClass} fade`}>
              <div className="tl-col-l">{photoLeft ? Photo : Text}</div>
              <div className="tl-col-r">{photoLeft ? Text : Photo}</div>
            </div>);

        })}
      </div>
    </section>);

}


// ===== Fair =====
// 既定データ（fairs.json が読み込めない場合のフォールバック）。
// 通常の編集は fair-editor.html から行い、fairs.json を差し替えてください。
const DEFAULT_FAIRS = [
{ date: '2026-06-06', d: '6 / 6', w: 'SAT', name: 'プレミアム試食フェア｜婚礼コースを2品体験', time: '10:00 / 13:30 / 16:00',
  tags: ['試食付き', '人気No.1', '貸切体験'], hot: true, slug: 'tasting' },
{ date: '2026-06-13', d: '6 / 13', w: 'SAT', name: 'はじめての見学相談会｜会場まるごと案内', time: '11:00 / 14:00',
  tags: ['初見学におすすめ', '個別相談'], slug: 'first-visit' },
{ date: '2026-06-20', d: '6 / 20', w: 'SAT', name: 'サンセット演出フェア｜夕景のセレモニー体験', time: '16:30',
  tags: ['夕景', '挙式体験', 'ナイト特典'], hot: true, slug: 'sunset' },
{ date: '2026-06-27', d: '6 / 27', w: 'SAT', name: 'ドレス試着フェア｜提携ショップ来場', time: '10:30 / 14:00',
  tags: ['ドレス試着', 'コーディネート相談'], slug: 'dress' },
{ date: '2026-07-04', d: '7 / 4', w: 'SAT', name: '平日休み向け｜じっくり1組貸切相談会', time: '11:00 / 15:00',
  tags: ['少人数婚', '貸切', '個別相談'], slug: 'private' }];

const FAIR_DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const FAIR_DOW_JP = ['日', '月', '火', '水', '木', '金', '土'];

// fair の日付を {y,m,d}（m は1始まり）に解釈。date 優先、無ければ d="M / D" を今年として解釈
function fairYMD(f) {
  if (f && typeof f.date === 'string') {
    const m = f.date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  }
  if (f && typeof f.d === 'string') {
    const m = f.d.match(/(\d{1,2})\s*[\/／]\s*(\d{1,2})/);
    if (m) return { y: new Date().getFullYear(), m: +m[1], d: +m[2] };
  }
  return null;
}
function fairKey(f) { const p = fairYMD(f); return p ? `${p.y}-${p.m}-${p.d}` : ''; }


function Fair() {
  const ref = useRef(null);
  const [fairs, setFairs] = useState(DEFAULT_FAIRS);
  const [view, setView] = useState(null);     // {y, m}（m は1始まり）
  const [sel, setSel] = useState(null);        // 選択中の日付キー "y-m-d"

  // fairs.json があれば優先的に読み込む（フェア更新は fair-editor.html → fairs.json 差し替え）
  useEffect(() => {
    fetch('fairs.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (Array.isArray(d) && d.length) setFairs(d); })
      .catch(() => {});
  }, []);

  // フェアが揃ったら、最初のフェアの月を初期表示・初期選択に
  useEffect(() => {
    const dated = fairs.map(fairYMD).filter(Boolean).sort((a, b) =>
      (a.y - b.y) || (a.m - b.m) || (a.d - b.d));
    if (!dated.length) return;
    const first = dated[0];
    setView({ y: first.y, m: first.m });
    setSel(`${first.y}-${first.m}-${first.d}`);
  }, [fairs]);

  // フェードイン
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    el.querySelectorAll('.fade').forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [fairs, view]);

  // 日付キー → その日のフェア配列
  const byDate = {};
  fairs.forEach((f) => { const k = fairKey(f); if (k) { (byDate[k] = byDate[k] || []).push(f); } });

  const v = view || (() => { const t = new Date(); return { y: t.getFullYear(), m: t.getMonth() + 1 }; })();
  const firstDow = new Date(v.y, v.m - 1, 1).getDay();
  const daysInMonth = new Date(v.y, v.m, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const shiftMonth = (delta) => {
    let m = v.m + delta, y = v.y;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setView({ y, m });
  };

  const selFairs = (sel && byDate[sel]) ? byDate[sel] : [];
  const selParts = sel ? sel.split('-').map(Number) : null;
  const selDow = selParts ? FAIR_DOW[new Date(selParts[0], selParts[1] - 1, selParts[2]).getDay()] : '';

  return (
    <section id="fair" className="fair" ref={ref}>
      <div className="head fade">
        <div className="eyebrow"><span className="ch-en">Bridal Fair</span><span className="ch-jp">フェア・ご見学</span></div>
        <h2 className="h-en">Find <em>Your</em> Day.</h2>
        <p className="h-jp">ブライダルフェア・見学予約</p>
      </div>

      <div className="fair-cal-wrap fade">
        <div className="fair-cal">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="前の月">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M14 6l-6 6 6 6" strokeLinecap="square" /></svg>
            </button>
            <div className="cal-title"><span className="y">{v.y}年</span><span className="m">{v.m}月</span></div>
            <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="次の月">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M10 6l6 6-6 6" strokeLinecap="square" /></svg>
            </button>
          </div>
          <div className="cal-grid">
            {FAIR_DOW_JP.map((w, i) =>
            <span key={'h' + i} className={"cal-dow" + (i === 0 ? " sun" : i === 6 ? " sat" : "")}>{w}</span>
            )}
            {cells.map((d, i) => {
              if (d === null) return <span key={'e' + i} className="cal-cell empty" />;
              const key = `${v.y}-${v.m}-${d}`;
              const has = !!byDate[key];
              const dow = new Date(v.y, v.m - 1, d).getDay();
              const cls = "cal-cell" + (has ? " has" : "") + (key === sel ? " sel" : "") +
                (dow === 0 ? " sun" : dow === 6 ? " sat" : "");
              return (
                <button
                  key={key}
                  className={cls}
                  disabled={!has}
                  onClick={() => has && setSel(key)}>
                  <span className="n">{d}</span>
                  {has && <span className="mk" />}
                </button>);
            })}
          </div>
          <div className="cal-legend"><span className="mk" />フェア開催日</div>
        </div>

        <div className="fair-day">
          {sel && selParts &&
          <div className="fair-day-head">
            <span className="dd">{selParts[1]} / {selParts[2]}</span>
            <span className="ww">{selDow}</span>
          </div>}
          {selFairs.length === 0 &&
          <p className="fair-day-empty">この日のフェアはありません。<br />カレンダーの<span className="mk" />印の日からお選びください。</p>}
          {selFairs.map((f, fi) =>
          <div className="fair-card" key={f.slug || fi}>
            <div className="name">{f.name}</div>
            <div className="time">{f.time}</div>
            <div className="fair-tags">
              {(f.tags || []).map((t, i) =>
            <span key={i} className={f.hot && i === 0 ? 'hot' : ''}>{t}</span>
            )}
            </div>
            <a className="fair-cta" href={`Reservation.html?fair=${f.slug || fi}&date=${f.date || fairKey(f)}`}>
              予約する<span className="arrow" />
            </a>
          </div>
          )}
        </div>
      </div>

      <div className="fair-foot fade">
        <p className="fair-note">
          ご希望の日程が合わない場合も、オンライン相談・個別のご案内を承ります。<br />
          まずはお気軽にお問い合わせください。
        </p>
        <a className="btn-primary" href="Reservation.html">
          来館予約・お問い合わせ<span className="arrow" />
        </a>
      </div>
    </section>);

}

// ===== Message =====
function Message() {
  const ref = useFadeIn();
  return (
    <section id="message" className="message" ref={ref}>
      <div className="head fade">
        <div className="crest" />
        <div className="eyebrow"><span className="ch-en">Message</span><span className="ch-jp">ごあいさつ</span></div>
        <h2 className="h-en">
          Because I <em>Met</em> You.
        </h2>
        <p className="h-jp">
          すべては<br />
          <span className="accent">「あなたに会えてよかった」</span>のために
        </p>
      </div>

      <div className="feature fade d1">
        <div className="photo" />
      </div>

      <div className="body-col fade d2">
        <p className="body-jp">
          私たちが考える結婚式の本質は、ゲストの皆さまが「このふたりの家族・友人で良かった」と思える時間を過ごすこと。
          そのために必要なことは、カップルの数だけ違います。だから私たちがご用意するのは、
          「東京」を額縁に収めたような絶景と美食、それだけ。それをシンプルなキャンバスにして、
          ふたりにとって意味のあるものだけを書き足していきましょう。<br /><br />
          「みんなと同じ」でなくていい。自然体な過ごし方も洗練された過ごし方も、
          穏やかな語らいも弾けるような笑い声も、どれも正解です。
          <span className="accent">「出会えた幸せ」</span>が、集まるすべての人に溢れだす、
          そんな時間を一緒に紡ぎませんか？
        </p>
        <div className="sig">— T&apos;SUKI sur la mer</div>
      </div>
    </section>);

}

// ===== Footer =====
function Footer() {
  return (
    <footer>
      <div className="ft-inner">
        <div className="ft-brand">T&apos;SUKI<br /><em style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '.72em' }}>sur la mer</em></div>
        <div className="ft-tag">A HOUSE RESTAURANT ON THE TOKYO BAY</div>
        <div className="ft-social">
          <a href="https://www.instagram.com/tsuki_wedding_tokyo?igsh=MXJoYTE3NDlscTFhcg==" target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
          </a>
          <a href="https://lin.ee/95ianWt" target="_blank" rel="noopener" aria-label="LINE">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 4c-4.97 0-9 3.24-9 7.24 0 3.58 3.3 6.58 7.76 7.15.3.06.71.2.81.46.09.24.06.6.03.85l-.13.79c-.04.24-.19.93.82.51 1.01-.42 5.44-3.2 7.42-5.48 1.37-1.5 2.02-3.02 2.02-4.73C21.55 7.24 17.52 4 12 4z" /></svg>
          </a>
        </div>
        <nav className="ft-links">
          <a href="Reservation.html">ご予約</a>
          <a href="Reservation.html">お問い合わせ</a>
          <a href="#">プライバシーポリシー</a>
          <a href="#">会社概要</a>
        </nav>
        <div className="ft-copy">© T&apos;SUKI sur la mer</div>
      </div>
    </footer>);

}

// ===== Side word =====
function SideWord({ show }) {
  if (!show) return null;
  return <div className="side-word">an elegance of tokyo</div>;
}

// ===== Floating CTA =====
function FloatingCTA({ show }) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => { if (show !== false) setHidden(false); }, [show]);
  if (hidden || show === false) return null;
  return (
    <div className="fab">
      <div className="promo-wrap">
        <button className="promo-close" onClick={() => setHidden(true)} aria-label="閉じる">×</button>
        <a className="promo" href="#/campaign">
          <img src="assets/promo-pop.png" alt="年内挙式・披露宴限定 最大45万円OFF" />
        </a>
      </div>
    </div>);

}

// ===== Tweaks settings =====
function applyTweaks(t) {
  const root = document.documentElement;
  // theme
  if (t.theme === 'cream') {
    root.style.setProperty('--night', '#2A2520');
    root.style.setProperty('--night-2', '#3A3329');
  } else if (t.theme === 'graphite') {
    root.style.setProperty('--night', '#1A1A1A');
    root.style.setProperty('--night-2', '#262624');
  } else {
    root.style.setProperty('--night', '#0E1A2B');
    root.style.setProperty('--night-2', '#14253B');
  }
  root.style.setProperty('--gold', t.accent);
  // display font
  root.style.setProperty('--display', `'${t.displayFont}', 'Cormorant Garamond', serif`);
}

// ===== Router / Pages =====
function useRoute() {
  const parse = () => ((location.hash || '').replace(/^#\/?/, '').split('?')[0] || 'home');
  const [route, setRoute] = useState(parse());
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

// ===== Gallery =====
const GALLERY_IMAGES = [
'assets/banquet.jpg', 'assets/ceremony-chapel.jpg', 'assets/cuisine-01.jpg',
'assets/ceremony-banquet.jpg', 'assets/cuisine-02.jpg', 'assets/day-ceremony.jpg',
'assets/cuisine-03.jpg', 'assets/photo-session.jpg', 'assets/cuisine-04.jpg',
'assets/rehearsal.jpg', 'assets/cuisine-05.jpg', 'assets/day-reception.jpg'];


function Gallery() {
  const ref = useFadeIn();
  return (
    <section id="gallery" className="concept-page" ref={ref}>
      <div className="cp-pagetitle">Gallery</div>
      <div className="cp-statement">
        <h2 className="cp-title fade">ひとときを、ひとコマずつ</h2>
      </div>
      <div className="cp-lead-block fade">
        <div className="cp-lead-body">
          <p>チャペル、パーティ、お料理、テラス…、ツキシュールラメールで生まれる情景を、そのままご覧ください。</p>
        </div>
      </div>
      <div className="gallery-grid">
        {GALLERY_IMAGES.map((src, i) =>
        <div key={i} className="gallery-cell fade" style={{ backgroundImage: `url('${src}')` }} />
        )}
      </div>
      <div className="cp-crumb fade"><a href="#/">Home</a><span className="sep">/</span><span>Gallery</span></div>
    </section>);

}

// ===== FAQ =====
const FAQ_GROUPS = [
{ cat: 'ご見学・ご予約について', items: [
  { q: '見学にはどのくらい時間がかかりますか？', a: 'ご試食や相談会を含めて、通常2時間〜3時間程度いただいております。お急ぎの場合は、1時間程度のショートコースも調整可能ですので事前にお知らせください。' },
  { q: 'ブライダルフェアの服装および持ち物の指定はありますか？', a: '特に指定はございませんが、試食付きのフェアにつきましては、ビーチサンダル・スポーツウェア・ランニングシャツ・カットオフジーンズ・ショートパンツ等カジュアルすぎる服装でのご来館はお控えください。持ち物は、写真が撮れるもの、筆記用具をお持ちいただけるとご検討の際に役立つかと思います。' },
  { q: '一人でも見学に行けますか？', a: 'はい、もちろんです。親御様やご友人と一緒にお越しいただく方や、お仕事帰りに新郎様・新婦様お一人で参加される方もたくさんいらっしゃいますので、お気軽にご予約ください。' },
  { q: '当日予約や、直前の見学予約は可能ですか？', a: 'はい、空き状況により当日のご案内も可能です。お電話でお問い合わせいただければ、最新の空き状況を確認し、スムーズにご案内させていただきます。' },
  { q: '平日に見学することはできますか？', a: 'はい、平日も承っております。平日はレストラン営業の合間に、本番に近い落ち着いた雰囲気の会場をじっくりとご覧いただけるため、非常におすすめです。（定休日を除く）' },
  { q: '予約はいつから可能ですか？', a: '通常、1年半前から承っております。直近の空き状況によってはお得なプランもございます。' }] },
{ cat: '挙式・披露宴について', items: [
  { q: '披露宴のみ、または少人数の食事会は可能ですか？', a: 'はい、可能です。ご家族のみの少人数ウエディングから、最大100名様規模のパーティーまで幅広く対応しております。' },
  { q: 'ナイトウエディングはできますか？', a: '可能です。東京湾の美しい夜景をバックにした、ドラマチックなパーティーが非常に人気です。' },
  { q: 'ペットと一緒に挙式はできますか？', a: '対応不可です。' },
  { q: '人前式の内容は自由に決められますか？', a: 'はい、おふたりらしい誓いの言葉や演出を取り入れたオリジナルの式をご提案いたします。' },
  { q: '親族のみの会食プランはありますか？', a: 'はい、少人数専用のプランをご用意しております。アットホームな雰囲気で美食を楽しんでいただけます。' }] },
{ cat: 'お料理について', items: [
  { q: '料理のコースはどのような内容ですか？', a: '「フレンチの巨匠」が監修する、旬の食材を活かした本格フレンチコースを提供しております。' },
  { q: 'アレルギー対応はしてもらえますか？', a: 'はい、ゲストごとのアレルギーや苦手な食材に合わせたメニュー変更を承っております。' },
  { q: 'オリジナルデザインのウェディングケーキは作れますか？', a: 'はい、パティシエとお打ち合わせいただき、世界に一つだけのデザインを作成可能です。' },
  { q: 'デザートビュッフェはできますか？', a: 'はい、デザートビュッフェ演出はゲストにも大変好評です。' },
  { q: '子供用のメニューはありますか？', a: 'はい、お子様の年齢に合わせたキッズプレートをご用意しております。' }] },
{ cat: 'お費用・プランについて', items: [
  { q: '支払い方法について教えてください。', a: '挙式日の数日前までにお振込みいただく形式が一般的ですが、詳細はお見積り時にご案内いたします。' },
  { q: '持ち込み料がかかるものは何ですか？', a: 'ドレス、引出物、カメラマンなど、項目によって持ち込み料の設定がございます。事前にお問い合わせください。' },
  { q: '予算に合わせたプラン提案はしてもらえますか？', a: 'はい、時期や人数に応じた最適なプランをご提案させていただきます。' }] },
{ cat: 'アクセス・設備について', items: [
  { q: '最寄り駅はどこですか？', a: 'ゆりかもめ「竹芝駅」より徒歩約1分、JR線「浜松町駅」北口より徒歩約8分と好アクセスです。' },
  { q: '駐車場はありますか？', a: '施設の1階に自社の駐車場が25台分ございます。' },
  { q: '列席者の着替え室や控室はありますか？', a: 'はい、ご親族様用、ご来賓・ご友人用の控室および更衣室を完備しております。' },
  { q: '授乳室やオムツ替えのスペースはありますか？', a: 'はい、小さなお子様連れのゲストにも安心して過ごしていただけるスペースをご案内いたします。' }] },
{ cat: '衣裳・演出について', items: [
  { q: '提携のドレスショップはありますか？', a: 'はい、複数の有名ドレスショップと提携しており、豊富なラインナップからお選びいただけます。' },
  { q: '列席者のヘアメイクや着付けは頼めますか？', a: 'はい、承っております。事前のご予約が必要となりますので、担当者へお伝えください。' },
  { q: '会場の装花は指定できますか？', a: '専属のフローリストとお打ち合わせいただき、お好みの色や雰囲気に合わせてコーディネートいたします。' },
  { q: 'プロジェクターや音響設備はありますか？', a: 'はい、大型スクリーンでの映像上映や、迫力ある音響演出が可能です。' }] },
{ cat: 'その他', items: [
  { q: '遠方のゲスト用の宿泊提携はありますか？', a: '近隣の提携ホテルをご紹介することが可能です。' },
  { q: '二次会のみの利用はできますか？', a: '2次会のみは受けておりません。アフターパーティーはご相談可能です。' },
  { q: '打ち合わせはオンラインでも可能ですか？', a: 'はい、遠方にお住まいの方やご多忙な方のために、オンラインでの打ち合わせも柔軟に対応しております。' }] }];


function FAQ() {
  const ref = useFadeIn();
  const [open, setOpen] = useState('0-0');
  let n = 0;
  return (
    <section id="faq" className="concept-page" ref={ref}>
      <div className="cp-pagetitle">F&amp;Q</div>
      <div className="cp-statement">
        <h2 className="cp-title fade">よくあるご質問</h2>
      </div>
      <div className="faq-wrap fade">
        {FAQ_GROUPS.map((g, gi) =>
        <div key={gi} className="faq-group">
          <h3 className="faq-cat">{g.cat}</h3>
          <div className="faq-list">
            {g.items.map((f, ii) => {
              const key = gi + '-' + ii;
              n += 1;
              return (
                <div key={key} className={"faq-item" + (open === key ? " open" : "")}>
                  <button className="faq-q" onClick={() => setOpen((v) => v === key ? '' : key)}>
                    <span className="faq-qt">{f.q}</span>
                    <span className="faq-mark" />
                  </button>
                  <div className="faq-a" style={{ maxHeight: open === key ? '600px' : '0' }}>
                    <p>{f.a}</p>
                  </div>
                </div>);
            })}
          </div>
        </div>
        )}
      </div>
      <div className="cp-crumb fade"><a href="#/">Home</a><span className="sep">/</span><span>F&amp;Q</span></div>
    </section>);

}

// ===== Campaign =====
function Campaign() {
  const ref = useFadeIn();
  return (
    <section id="campaign" className="concept-page" ref={ref}>
      <div className="cp-statement">
        <div className="cmp-badge fade">CAMPAIGN</div>
        <h2 className="cp-title fade">年内挙式・披露宴限定<br />会場使用料OFF</h2>
        <p className="cmp-note fade">※会場使用料は日程に応じて 5万円〜45万円</p>
        <p className="cmp-sub fade">街がクリスタルに輝く季節を特別価格で</p>
      </div>

      <div className="cmp-kv fade" style={{ backgroundImage: "url('assets/campaign-kv.jpg')" }} />

      <div className="cp-lead-block fade">
        <div className="cp-lead-body">
          <p>空気が澄み渡る秋・冬は、T&apos;suki sur la mer から見える景色も透明度が増す季節。<br />特にイルミネーションのきらめきは、他の季節と比べても格別。<br />この特別な季節に、特別な結婚式を。</p>
        </div>
      </div>

      <div className="cmp-foot fade">
        <div className="cmp-foot-label">T&apos;suki sur la mer ｜ Bridal Fair</div>
        <a className="cp-link-btn" href="Reservation.html">RESERVATION</a>
      </div>

      <div className="cp-crumb fade"><a href="#/">Home</a><span className="sep">/</span><span>Campaign</span></div>
    </section>);

}

const PAGES = [
  { slug: 'concept',  en: 'Concept',  jp: 'コンセプト',    Comp: Concept,  img: 'assets/concept-kv.jpg', pano: true, noHeader: true,
    lead: 'おもてなしは、「東京」という街のエレガンス。<br />五感で感じるすべてが、語り合いたくなる理由になる場所へ。' },
  { slug: 'banquet',  en: 'Banquet',  jp: '会場',          Comp: Banquet,  img: 'assets/banquet-kv.jpg', pano: true,
    lead: 'リゾート気分で眺める大都会のパノラマ。<br />東京湾とレインボーブリッジを望む、海辺の一軒家。' },
  { slug: 'ceremony', en: 'Ceremony', jp: '挙式',          Comp: Ceremony, img: 'assets/ceremony-kv.jpg', pano: true,
    lead: '３つのスタイルから選べる誓いの形。ふたりの感性とゲストの顔ぶれに合わせて。' },
  { slug: 'cuisine',  en: 'Cuisine',  jp: 'お料理',        Comp: Cuisine,  img: 'assets/cuisine-kv.jpg', pano: true,
    lead: '記念日レストランならではのご提案。ミシュラン星を重ねたシェフが手がける至高の一皿を。' },
  { slug: 'dresses',  en: 'Dress',    jp: 'ドレス',        Comp: Dresses,  img: 'assets/dress-main.avif', noHeroImg: true,
    slides: ['assets/dress-main.avif','assets/dress-01.avif','assets/dress-02.avif','assets/dress-03.avif','assets/dress-05.avif','assets/dress-07.avif'],
    lead: '約120店舗・5,000着のラインナップから、あなただけの特別な一着を。' },
  { slug: 'day',      en: 'A Day',    jp: '当日の流れ',     Comp: Timeline, img: 'assets/day-reception.jpg', noHeroImg: true,
    lead: '朝の支度からお見送りまで。瞬きするのが惜しい、一日の物語。' },
  { slug: 'gallery',  en: 'Gallery',  jp: 'ギャラリー',      Comp: Gallery,  img: 'assets/banquet.jpg', noHeader: true,
    lead: 'チャペル、パーティ、お料理、テラス…ここで生まれる情景をひとコマずつ。' },
  { slug: 'faq',      en: 'F&Q',      jp: 'よくある質問',   Comp: FAQ,      img: 'assets/concept-bg.jpg', noHeader: true,
    lead: 'ご見学・お料理・ドレスなど、初めての方からよくいただくご質問にお答えします。' },
  { slug: 'fair',     en: 'Fair',     jp: 'ブライダルフェア', Comp: Fair,    img: 'assets/photo-session.jpg',
    lead: '試食や会場見学ができるブライダルフェアを開催。まずはお気軽にご体験ください。' },
  { slug: 'message',  en: 'Message',  jp: 'ごあいさつ',     Comp: Message,  img: 'assets/message.jpg',
    lead: '大切な皆さまへ。私たちがお約束したい、ひとときへの思い。' },
  { slug: 'campaign', en: 'Campaign', jp: 'キャンペーン',    Comp: Campaign, img: 'assets/campaign-kv.jpg', noHeader: true }];


function PageHeader({ page }) {
  const panoRef = useRef(null);
  useEffect(() => {
    const el = panoRef.current;
    if (!el || !page.pano) return;
    let dragging = false, sx = 0, sy = 0, pos = 50, startPos = 50, axis = '';
    el.style.backgroundPosition = pos + '% center';
    el.style.backgroundSize = 'cover';
    const down = (e) => { dragging = true; axis = ''; sx = (e.touches ? e.touches[0].clientX : e.clientX); sy = (e.touches ? e.touches[0].clientY : e.clientY); startPos = pos; el.classList.add('grabbing'); };
    const move = (e) => {
      if (!dragging) return;
      const x = (e.touches ? e.touches[0].clientX : e.clientX);
      const y = (e.touches ? e.touches[0].clientY : e.clientY);
      if (!axis) { axis = Math.abs(x - sx) > Math.abs(y - sy) ? 'x' : 'y'; }
      if (axis === 'y') { dragging = false; el.classList.remove('grabbing'); return; }
      pos = Math.max(0, Math.min(100, startPos - (x - sx) / el.clientWidth * 120));
      el.style.backgroundPosition = pos + '% center';
      if (e.cancelable) e.preventDefault();
    };
    const up = () => { dragging = false; el.classList.remove('grabbing'); };
    el.addEventListener('touchstart', down, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', up);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('touchstart', down);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', up);
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [page.pano, page.img]);
  return (
    <React.Fragment>
      <div className="cp-pagetitle">{page.en}</div>
      {!page.noHeroImg && (page.pano ?
      <div className="cp-tophero cp-pano" ref={panoRef} style={{ backgroundImage: `url('${page.img}')` }}>
        <div className="cp-pano-hint" aria-hidden="true"><span className="l">←</span>swipe<span className="r">→</span></div>
      </div> :
      <div className="cp-tophero" style={{ backgroundImage: `url('${page.img}')` }} />)}
    </React.Fragment>);

}

function HomeIndex() {
  const ref = useRef(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const items = ref.current ? Array.from(ref.current.querySelectorAll('.seq-item')) : [];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          const idx = Number(e.target.getAttribute('data-idx'));
          if (!Number.isNaN(idx)) setActive(idx);
        }
      });
    }, { threshold: 0.2 });
    items.forEach((n) => io.observe(n));
    const fallback = setTimeout(() => items.forEach((n) => n.classList.add('in')), 1600);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);
  const seqPages = PAGES.filter((p) => p.slug !== 'message' && p.slug !== 'campaign');
  useEffect(() => {
    if (!ref.current) return;
    const els = Array.from(ref.current.querySelectorAll('.seq-img.pano'));
    const cleanups = els.map((el) => {
      const zone = el.closest('.seq-item') || el;
      zone.classList.add('pano-zone');
      let dragging = false, sx = 0, sy = 0, pos = 50, startPos = 50, moved = false, axis = '';
      el.style.backgroundPosition = pos + '% center';
      el.style.backgroundSize = 'cover';
      const getX = (e) => e.touches ? e.touches[0].clientX : e.clientX;
      const getY = (e) => e.touches ? e.touches[0].clientY : e.clientY;
      const down = (e) => { dragging = true; moved = false; axis = ''; sx = getX(e); sy = getY(e); startPos = pos; el.classList.add('grabbing'); };
      const move = (e) => {
        if (!dragging) return;
        const x = getX(e), y = getY(e);
        const dx = x - sx, dy = y - sy;
        if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'y') { dragging = false; return; }
        if (axis === 'x') {
          moved = true;
          pos = Math.max(0, Math.min(100, startPos - dx / el.clientWidth * 120));
          el.style.backgroundPosition = pos + '% center';
          if (e.cancelable) e.preventDefault();
        }
      };
      const up = () => { dragging = false; el.classList.remove('grabbing'); };
      const clk = (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } };
      zone.addEventListener('pointerdown', down);
      zone.addEventListener('touchstart', down, { passive: true });
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('touchmove', move, { passive: false });
      window.addEventListener('pointerup', up);
      window.addEventListener('touchend', up);
      el.addEventListener('click', clk, true);
      return () => {
        zone.removeEventListener('pointerdown', down);
        zone.removeEventListener('touchstart', down);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('touchmove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('touchend', up);
        el.removeEventListener('click', clk, true);
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
  useEffect(() => {
    const groups = ref.current ? Array.from(ref.current.querySelectorAll('.seq-slides')) : [];
    const timers = groups.map((g) => {
      const slides = Array.from(g.querySelectorAll('.seq-slide'));
      if (slides.length < 2) return null;
      let idx = 0;
      return setInterval(() => {
        slides[idx].classList.remove('on');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('on');
      }, 2000);
    });
    return () => timers.forEach((t) => t && clearInterval(t));
  }, []);
  return (
    <div className="home-seq" ref={ref}>
      {seqPages.map((p, i) =>
      <section key={p.slug} className={"seq-item" + (i >= 5 ? " sm" : "")} data-idx={i}>
        <a className="seq-title" href={`#/${p.slug}`}>{p.en}</a>
        {p.slides ?
        <a className="seq-img seq-slides" href={`#/${p.slug}`} aria-label={p.en}>
          {p.slides.map((s, k) =>
          <span key={k} className={"seq-slide" + (k === 0 ? " on" : "")} style={{ backgroundImage: `url('${s}')` }} />
          )}
        </a> :
        <a className={"seq-img" + (p.pano ? " pano" : "")} href={`#/${p.slug}`} style={{ backgroundImage: `url('${p.img}')` }} aria-label={p.en} />}
        {p.pano && <div className="seq-pano-hint" aria-hidden="true"><span className="l">←</span>swipe<span className="r">→</span></div>}
        <div className="seq-foot">
          <p className="seq-lead" dangerouslySetInnerHTML={{ __html: p.lead }} />
          <a className="seq-more" href={`#/${p.slug}`}>View More</a>
        </div>
        <span className="seq-cue" aria-hidden="true" />
      </section>
      )}
    </div>);

}

function PageNav({ prev, next }) {
  return (
    <nav className="page-nav">
      <a href={prev ? `#/${prev.slug}` : '#/'} className="prev">
        <span className="pn-dir"><span className="ar">←</span> {prev ? 'Prev' : 'Home'}</span>
        <span className="pn-en">{prev ? prev.en : 'Top'}</span>
        <span className="pn-jp">{prev ? prev.jp : 'トップへ'}</span>
      </a>
      <a href={next ? `#/${next.slug}` : '#/'} className="next">
        <span className="pn-dir">{next ? 'Next' : 'Home'} <span className="ar">→</span></span>
        <span className="pn-en">{next ? next.en : 'Top'}</span>
        <span className="pn-jp">{next ? next.jp : 'トップへ'}</span>
      </a>
    </nav>);

}

// ===== App =====
function App() {
  const [tweaks, setTweaks] = window.useTweaks ?
  window.useTweaks(TWEAK_DEFAULTS) :
  [TWEAK_DEFAULTS, () => {}];
  useEffect(() => {applyTweaks(tweaks);}, [tweaks]);

  const route = useRoute();
  const idx = PAGES.findIndex((p) => p.slug === route);
  const page = idx >= 0 ? PAGES[idx] : null;

  return (
    <>
      <Header tweaks={tweaks} />
      <SideWord show={tweaks.showSideWord} />
      {page ?
      <main className="subpage" key={page.slug}>
          {!page.noHeader && <PageHeader page={page} />}
          <page.Comp />
        </main> :

      <React.Fragment>
          <Hero />
          <HomeIndex />
        </React.Fragment>}
      <Footer />
      <FloatingCTA show={tweaks.showPromo} />
      {window.TweaksPanel &&
      <window.TweaksPanel>
          <window.TweakSection label="テーマ">
            <window.TweakRadio
            label="Mood"
            value={tweaks.theme}
            onChange={(v) => setTweaks('theme', v)}
            options={[
            { label: 'Night', value: 'night' },
            { label: 'Cream', value: 'cream' },
            { label: 'Graphite', value: 'graphite' }]
            } />
          
            <window.TweakColor
            label="アクセント"
            value={tweaks.accent}
            onChange={(v) => setTweaks('accent', v)}
            options={['#B89968', '#C8AE82', '#B8A07E', '#8FA39B', '#6F7E94']} />
          
          </window.TweakSection>
          <window.TweakSection label="タイポグラフィ">
            <window.TweakSelect
            label="ディスプレイ書体"
            value={tweaks.displayFont}
            onChange={(v) => setTweaks('displayFont', v)}
            options={[
            { label: 'Italiana', value: 'Italiana' },
            { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
            { label: 'Shippori Mincho', value: 'Shippori Mincho' }]
            } />
          
          </window.TweakSection>
          <window.TweakSection label="演出">
            <window.TweakToggle
            label="サイドワード"
            value={tweaks.showSideWord}
            onChange={(v) => setTweaks('showSideWord', v)} />
            <window.TweakToggle
            label="キャンペーンPOP"
            value={tweaks.showPromo}
            onChange={(v) => setTweaks('showPromo', v)} />
          
          </window.TweakSection>
        </window.TweaksPanel>
      }
    </>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);