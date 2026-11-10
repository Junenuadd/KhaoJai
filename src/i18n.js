// Interface language (menus, buttons, sign-in, onboarding, player controls).
// Lesson explanations are in English for now; translated lesson content can be added later per language.
// Translations by น้องเบ้บ (v0.7, 2026-11-07) — please have native speakers check zh / ja / ko before launch.
import { S } from './store.js';

export const LANGS = [['en', 'English'], ['th', 'ไทย'], ['zh', '中文'], ['ja', '日本語'], ['ko', '한국어']];

const D = {
  // navigation
  learn:        ['Learn', 'เรียน', '学习', '学ぶ', '학습'],
  letters:      ['ก–ฮ', 'ก–ฮ', 'ก–ฮ', 'ก–ฮ', 'ก–ฮ'],
  lettersLong:  ['Letters ก–ฮ', 'ตัวอักษร ก–ฮ', '字母 ก–ฮ', '文字 ก–ฮ', '글자 ก–ฮ'],
  practice:     ['Practice', 'ฝึก', '练习', '練習', '연습'],
  decoder:      ['Decoder', 'ถอดความ', '解读', '解読', '해석기'],
  me:           ['Me', 'ฉัน', '我的', 'マイページ', '내 정보'],
  homework:     ['Homework', 'การบ้าน', '作业', '宿題', '숙제'],
  plus:         ['Plus', 'Plus', 'Plus', 'Plus', 'Plus'],
  account:      ['Account', 'บัญชี', '账户', 'アカウント', '계정'],
  signIn:       ['Sign in', 'เข้าสู่ระบบ', '登录', 'ログイン', '로그인'],
  signOut:      ['Sign out', 'ออกจากระบบ', '退出登录', 'ログアウト', '로그아웃'],
  // welcome & sign-in
  tagline:      ['Read Thai from your very first letter. Short lessons, real tests, no Thai needed to start.', 'อ่านภาษาไทยได้ตั้งแต่ตัวอักษรแรก บทเรียนสั้น มีแบบทดสอบจริง ไม่ต้องรู้ภาษาไทยมาก่อน', '从第一个字母开始读泰语。课程简短，有真正的测验，零基础也能学。', '最初の一文字からタイ語が読める。短いレッスンと本物のテスト。タイ語の知識は不要です。', '첫 글자부터 태국어를 읽어요. 짧은 레슨, 실제 테스트, 태국어를 몰라도 시작할 수 있어요.'],
  letters44:    ['44 letters', '44 ตัวอักษร', '44 个字母', '44文字', '44글자'],
  perDay:       ['a day', 'ต่อวัน', '每天', '1日', '하루'],
  free:         ['Free', 'ฟรี', '免费', '無料', '무료'],
  toStart:      ['to start', 'เริ่มต้น', '开始', 'で始める', '로 시작'],
  startFree:    ['Start learning — create a free account', 'เริ่มเรียน — สร้างบัญชีฟรี', '开始学习 — 免费注册', '学習を始める — 無料登録', '학습 시작 — 무료 계정 만들기'],
  logIn:        ['Log in', 'เข้าสู่ระบบ', '登录', 'ログイン', '로그인'],
  language:     ['Language', 'ภาษา', '语言', '言語', '언어'],
  welcomeBack:  ['Welcome back!', 'ยินดีต้อนรับกลับมา!', '欢迎回来！', 'おかえりなさい！', '다시 오신 것을 환영해요!'],
  signInToKeep: ['Sign in to keep learning.', 'เข้าสู่ระบบเพื่อเรียนต่อ', '登录以继续学习。', 'ログインして学習を続けましょう。', '로그인하고 계속 학습하세요.'],
  createAcct:   ['Create your account', 'สร้างบัญชีของคุณ', '创建账户', 'アカウントを作成', '계정 만들기'],
  savedEvery:   ['Your progress is saved to it, on every device.', 'ความคืบหน้าจะถูกบันทึกไว้ ใช้ได้ทุกเครื่อง', '你的进度会保存在账户中，所有设备通用。', '進み具合はアカウントに保存され、どの端末でも使えます。', '진도가 계정에 저장되어 모든 기기에서 이어서 할 수 있어요.'],
  email:        ['Email', 'อีเมล', '电子邮箱', 'メールアドレス', '이메일'],
  password:     ['Password', 'รหัสผ่าน', '密码', 'パスワード', '비밀번호'],
  newPassword:  ['Create a password', 'ตั้งรหัสผ่าน', '设置密码', 'パスワードを作成', '비밀번호 만들기'],
  yourName:     ['Your name', 'ชื่อของคุณ', '你的名字', 'お名前', '이름'],
  mobile:       ['Mobile number', 'เบอร์มือถือ', '手机号码', '携帯電話番号', '휴대폰 번호'],
  optional:     ['(optional)', '(ไม่บังคับ)', '（可选）', '（任意）', '(선택)'],
  continue:     ['Continue', 'ต่อไป', '继续', '次へ', '계속'],
  forgot:       ['Forgot password?', 'ลืมรหัสผ่าน?', '忘记密码？', 'パスワードを忘れた場合', '비밀번호를 잊으셨나요?'],
  codeInstead:  ['Email me a code instead', 'ส่งรหัสทางอีเมลแทน', '改用邮箱验证码', '代わりにメールでコードを送る', '대신 이메일로 코드 받기'],
  newHere:      ['New to KhaoJai?', 'เพิ่งมาครั้งแรก?', '第一次使用 KhaoJai？', 'KhaoJai は初めてですか？', 'KhaoJai가 처음이신가요?'],
  haveAcct:     ['Already have an account?', 'มีบัญชีอยู่แล้ว?', '已有账户？', 'アカウントをお持ちですか？', '이미 계정이 있나요?'],
  checkEmail:   ['Check your email', 'ตรวจสอบอีเมลของคุณ', '请查看你的邮箱', 'メールを確認してください', '이메일을 확인하세요'],
  privacyLink:  ['Privacy & terms', 'ความเป็นส่วนตัวและข้อกำหนด', '隐私与条款', 'プライバシーと利用規約', '개인정보 및 이용약관'],
  // notice & onboarding
  beforeStart:  ['Before you start', 'ก่อนเริ่มเรียน', '开始之前', 'はじめる前に', '시작하기 전에'],
  startLearning:['Start learning', 'เริ่มเรียน', '开始学习', '学習を始める', '학습 시작'],
  backLearning: ['Back to learning', 'กลับไปเรียน', '返回学习', '学習に戻る', '학습으로 돌아가기'],
  fewQuestions: ['A few quick questions', 'คำถามสั้นๆ ไม่กี่ข้อ', '几个简单的问题', 'かんたんな質問', '간단한 질문 몇 가지'],
  findStart:    ['Let\'s find your starting point', 'มาหาจุดเริ่มต้นของคุณกัน', '找到适合你的起点', 'あなたのスタート地点を見つけましょう', '시작점을 찾아볼게요'],
  enNote:       ['Lesson explanations are in English for now.', 'ตอนนี้คำอธิบายในบทเรียนยังเป็นภาษาอังกฤษ', '目前课程讲解为英文。', '現在、レッスンの説明は英語です。', '현재 레슨 설명은 영어로 제공돼요.'],
  // dashboard
  continueLearning: ['Continue learning', 'เรียนต่อ', '继续学习', '学習を続ける', '계속 학습하기'],
  reviewRetake: ['Review & retake', 'ทบทวนและสอบใหม่', '复习并重考', '復習して再テスト', '복습 후 재시험'],
  yourSkills:   ['Your skills', 'ทักษะของคุณ', '你的技能', 'あなたのスキル', '내 실력'],
  lessonsPassed:['lessons passed in', 'บทที่ผ่านแล้วใน', '课已通过，属于', 'レッスン合格：', '개 레슨 통과:'],
  needsReview:  ['Needs review', 'ต้องทบทวน', '需要复习', '要復習', '복습 필요'],
  // player
  check:        ['Check', 'ตรวจคำตอบ', '检查', '答え合わせ', '확인'],
  gotIt:        ['Got it', 'เข้าใจแล้ว', '明白了', 'わかった', '알겠어요'],
  start:        ['Start', 'เริ่ม', '开始', 'スタート', '시작'],
  next:         ['Continue', 'ต่อไป', '继续', '次へ', '계속'],
  showRom:      ['Show romanization', 'แสดงคำอ่าน', '显示罗马拼音', 'ローマ字を表示', '로마자 보기'],
  hideRom:      ['Hide romanization', 'ซ่อนคำอ่าน', '隐藏罗马拼音', 'ローマ字を隠す', '로마자 숨기기'],
  notQuite:     ['Not quite', 'ยังไม่ถูก', '还不对', 'おしい！', '아쉬워요'],
  answer:       ['Answer', 'คำตอบ', '答案', '正解', '정답'],
  nice:         ['Nice!', 'เก่งมาก!', '太棒了！', 'すごい！', '잘했어요!']
};
const IDX = { en: 0, th: 1, zh: 2, ja: 3, ko: 4 };
export function lang() {
  if (S.lang && IDX[S.lang] !== undefined) return S.lang;
  const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return IDX[n] !== undefined ? n : 'en';
}
export const t = k => (D[k] ? D[k][IDX[lang()]] || D[k][0] : k);
