import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ShoppingBag,
  User,
  ShieldCheck,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Award,
  MessageCircle,
  Lock,
  ArrowRight,
  ChevronRight,
  Package,
  CreditCard,
  QrCode,
  Mail,
  LogOut,
  Edit3,
  Upload,
  Eye,
  EyeOff,
  Truck,
  Tag,
  Database,
  Instagram,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  Check,
  SlidersHorizontal,
  Heart,
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';

// ============================================================================
// CONFIGURAÇÕES OFICIAIS DA LOJA CYBELE IMPORTS
// ============================================================================
const firebaseConfig =
  typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const app = firebaseConfig
  ? getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0]
  : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'cybele-imports-store';

const STORE_CONFIG = {
  name: 'CYBELE IMPORTS',
  subtitle: 'CURADORIA INTERNACIONAL',
  whatsappNumber: '+55 15 99786-0198',
  whatsappLink:
    'https://wa.me/5515997860198?text=Ol%C3%A1!%20Conheci%20a%20Cybele%20Imports%20pelo%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20os%20produtos.',
  instagramHandle: '@cibele_fog_barros',
  instagramLink: 'https://www.instagram.com/cibele_fog_barros/',
  adminNotificationEmail: 'iranhigorpanizzon@gmail.com',
  adminNotificationRecipients: [
    {
      name: 'Iran Higor Panizzon',
      email: 'iranhigorpanizzon@gmail.com',
      role: 'Administrador',
    },
    {
      name: 'Cibelle Fogaça',
      email: 'cibellefogaca@gamil.com',
      alternateEmail: 'cibellefogaca@gmail.com',
      role: 'Proprietária',
    },
  ],
  ownerAccounts: {
    'iranhigorpanizzon@gmail.com': 'Panizzon123@',
    'cibellefogaca@gamil.com': '150107',
    'cibellefogaca@gmail.com': '150107',
  },
  pixKey: '36397679000141',
  pixMerchantName: 'CYBELE IMPORTS',
  pixMerchantCity: 'SOROCABA',
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);

const sanitizeText = (value) =>
  String(value || '')
    .replace(/[<>]/g, '')
    .trim();

async function verifyOwnerCredentials(emailInput, passwordInput) {
  const cleanEmail = String(emailInput || '').trim().toLowerCase();
  const cleanPassword = String(passwordInput || '').trim();
  const expectedPassword = STORE_CONFIG.ownerAccounts[cleanEmail];
  if (!expectedPassword) return false;
  return cleanPassword === expectedPassword;
}

const CATEGORIES = [
  {
    id: 'Todos',
    label: 'Todos',
    image:
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Perfumes',
    label: 'Perfumes',
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Cosméticos',
    label: 'Cosméticos',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Eletrônicos',
    label: 'Eletrônicos',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Acessórios',
    label: 'Acessórios',
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Moda',
    label: 'Moda',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Relógios',
    label: 'Relógios',
    image:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Beleza',
    label: 'Beleza',
    image:
      'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Produtos variados',
    label: 'Variados',
    image:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'Ofertas',
    label: 'Ofertas',
    image:
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80',
  },
];

// ============================================================================
// GERADOR OFICIAL DE PAYLOAD PIX (PADRÃO EMV / BANCO CENTRAL - SEM TAXAS)
// ============================================================================
function computePixCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function buildPixEmvPayload({ pixKey, merchantName, merchantCity, amount, txid }) {
  const formatField = (id, value) => {
    const str = String(value);
    const len = str.length.toString().padStart(2, '0');
    return `${id}${len}${str}`;
  };

  const cleanKey = String(pixKey || '36397679000141').replace(/\D/g, '');
  const cleanName = String(merchantName || 'CYBELE IMPORTS')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, 25) || 'CYBELE IMPORTS';

  const cleanCity = String(merchantCity || 'SOROCABA')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, 15) || 'BRASIL';

  const cleanTxid =
    String(txid || 'CYBELEIMPORTS')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 25) || '***';

  const gui = formatField('00', 'br.gov.bcb.pix');
  const keyField = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${keyField}`);

  const formattedAmount = Number(amount || 0).toFixed(2);
  const additionalData = formatField('62', formatField('05', cleanTxid));

  const partialPayload =
    formatField('00', '01') +
    merchantAccountInfo +
    formatField('52', '0000') +
    formatField('53', '986') +
    (Number(amount) > 0 ? formatField('54', formattedAmount) : '') +
    formatField('58', 'BR') +
    formatField('59', cleanName) +
    formatField('60', cleanCity) +
    additionalData +
    '6304';

  const crc = computePixCRC16(partialPayload);
  return `${partialPayload}${crc}`;
}

const compressImageFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.84));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ============================================================================
// COMPONENTE PRINCIPAL — CYBELE IMPORTS
// ============================================================================
export default function App() {
  // Navegação e Views ('store' | 'account' | 'admin')
  const [activeView, setActiveView] = useState('store');

  // Autenticação e Diferenciação de Perfis ('owner' | 'customer' | null)
  const [cloudUser, setCloudUser] = useState(null);
  const [customerProfile, setCustomerProfile] = useState(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('cybele_owner_session') === 'active';
    } catch {
      return false;
    }
  });

  // Modal de Autenticação (Login Cliente, Cadastro Cliente, Acesso Proprietária)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'admin'
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [failedAdminAttempts, setFailedAdminAttempts] = useState(0);
  const [adminLockUntil, setAdminLockUntil] = useState(0);

  // Estado do Banco de Dados em Tempo Real
  const [dbSyncStatus, setDbSyncStatus] = useState(db ? 'connecting' : 'local');
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_products_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_orders_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_coupons_v1');
      return saved ? JSON.parse(saved) : [{ code: 'CYBELE10', discountPercent: 10, active: true }];
    } catch {
      return [{ code: 'CYBELE10', discountPercent: 10, active: true }];
    }
  });

  const [shippingConfig, setShippingConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_shipping_v1');
      return saved
        ? JSON.parse(saved)
        : { flatRate: 25.0, freeShippingMin: 350.0, allowPickup: true };
    } catch {
      return { flatRate: 25.0, freeShippingMin: 350.0, allowPickup: true };
    }
  });

  // Catálogo & Filtros
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [editorialFilter, setEditorialFilter] = useState('all'); // 'all' | 'featured' | 'new' | 'bestseller' | 'promo'
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  // Carrinho Persistente
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('shipping'); // 'shipping' | 'pickup'

  // Checkout Simplificado & Mercado Pago
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Confirmação
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    paymentMethod: 'pix', // 'pix' | 'credit_card'
    lgpdAccepted: true,
  });
  const [completedOrder, setCompletedOrder] = useState(null);

  // Painel Administrativo da Proprietária
  const [adminTab, setAdminTab] = useState('products'); // 'products' | 'orders' | 'settings'
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    promoPrice: '',
    stock: '1',
    category: 'Perfumes',
    image: '',
    isFeatured: true,
    isNew: true,
    isBestSeller: false,
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');
  const [emailDispatchPreview, setEmailDispatchPreview] = useState(null);
  const [emailLogs, setEmailLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('cybele_email_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [emailWebhookUrl, setEmailWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem('cybele_email_webhook_v1') || '';
    } catch {
      return '';
    }
  });

  // Notificação Flutuante (Toast)
  const [toast, setToast] = useState(null);
  const footerClickCountRef = useRef(0);
  const catalogSectionRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4200);
  };

  // =========================================================================
  // SINCRONIZAÇÃO COM FIRESTORE EM TEMPO REAL & PERSISTÊNCIA LOCAL
  // =========================================================================
  useEffect(() => {
    try {
      localStorage.setItem('cybele_cart_v1', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('cybele_products_v1', JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('cybele_orders_v1', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('cybele_coupons_v1', JSON.stringify(coupons));
    } catch (e) {
      console.error(e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('cybele_shipping_v1', JSON.stringify(shippingConfig));
    } catch (e) {
      console.error(e);
    }
  }, [shippingConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('cybele_email_logs_v1', JSON.stringify(emailLogs));
    } catch (e) {
      console.error(e);
    }
  }, [emailLogs]);

  // Monitor de Autenticação Firebase (Google / E-mail & Senha / Anônimo para leitura)
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        try {
          await signInAnonymously(auth);
        } catch {
          // Segue sem sessão anônima se não habilitada
        }
        setCloudUser(null);
        setCustomerProfile(null);
        return;
      }

      setCloudUser(u);
      if (!u.isAnonymous) {
        const ownerMatch = Boolean(
          u.email && STORE_CONFIG.ownerAccounts[u.email.trim().toLowerCase()]
        );
        const profile = {
          uid: u.uid,
          name: u.displayName || u.email?.split('@')[0] || 'Cliente VIP',
          email: u.email,
          photoURL: u.photoURL || null,
          provider: u.providerData?.[0]?.providerId || 'password',
          role: ownerMatch ? 'owner' : 'customer',
        };
        setCustomerProfile(profile);
        if (ownerMatch) {
          setIsAdminAuthenticated(true);
          try {
            sessionStorage.setItem('cybele_owner_session', 'active');
          } catch {}
        }
        setCheckoutForm((prev) => ({
          ...prev,
          fullName: prev.fullName || profile.name,
          email: prev.email || profile.email || '',
        }));
      } else {
        setCustomerProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listeners Firestore em Tempo Real (Produtos, Pedidos e Configurações)
  useEffect(() => {
    if (!db) {
      setDbSyncStatus('local');
      return;
    }

    setDbSyncStatus('connecting');
    const unsubProducts = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'products')),
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setProducts(list);
        setDbSyncStatus('synced');
      },
      () => {
        setDbSyncStatus('local');
      }
    );

    const unsubOrders = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'orders')),
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setOrders(list);
      },
      () => {}
    );

    const unsubSettings = onSnapshot(
      doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'store'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.coupons) setCoupons(data.coupons);
          if (data.shippingConfig) setShippingConfig(data.shippingConfig);
          if (typeof data.emailWebhookUrl === 'string') {
            setEmailWebhookUrl(data.emailWebhookUrl);
          }
        }
      },
      () => {}
    );

    const unsubEmailLogs = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'email_notifications')),
      (snapshot) => {
        const list = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        if (list.length > 0) setEmailLogs(list);
      },
      () => {}
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubSettings();
      unsubEmailLogs();
    };
  }, [cloudUser]);

  // Atalho discreto para acesso administrativo (#admin ou Ctrl+Shift+A)
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        if (isAdminAuthenticated) {
          setActiveView('admin');
        } else {
          setAuthModalMode('admin');
          setAuthError('');
          setIsAccountModalOpen(true);
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdminAuthenticated) {
          setActiveView((prev) => (prev === 'admin' ? 'store' : 'admin'));
        } else {
          setAuthModalMode('admin');
          setAuthError('');
          setIsAccountModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminAuthenticated]);

  // =========================================================================
  // AUTENTICAÇÃO DO CLIENTE (GOOGLE / E-MAIL & SENHA) E PROPRIETÁRIA
  // =========================================================================
  const isOwnerEmail = (email) =>
    typeof email === 'string' &&
    Boolean(STORE_CONFIG.ownerAccounts[email.trim().toLowerCase()]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    if (!auth) {
      setAuthError(
        'O login com Google requer configuração ativa do Firebase Auth. Utilize E-mail e Senha ou configure as chaves.'
      );
      return;
    }

    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (db && user) {
        await setDoc(
          doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'),
          {
            uid: user.uid,
            name: user.displayName || 'Cliente Cybele Imports',
            email: user.email,
            lastLoginAt: new Date().toISOString(),
            authMethod: 'google',
            role: isOwnerEmail(user.email) ? 'owner' : 'customer',
          },
          { merge: true }
        );
      }

      setIsAccountModalOpen(false);
      if (isOwnerEmail(user?.email)) {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('cybele_owner_session', 'active');
        } catch {}
        setActiveView('admin');
        showToast('Bem-vinda, Proprietária! Painel Administrativo liberado.');
      } else {
        setIsAdminAuthenticated(false);
        setActiveView('account');
        showToast(`Bem-vindo(a), ${user.displayName || 'Cliente'}!`);
      }
    } catch (err) {
      setAuthError('Não foi possível concluir o acesso com Google. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCustomerEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = sanitizeText(authForm.email).toLowerCase();
    const cleanName = sanitizeText(authForm.name);

    if (!cleanEmail.includes('@')) {
      setAuthError('Informe um endereço de e-mail válido.');
      return;
    }

    if (isOwnerEmail(cleanEmail)) {
      if (authModalMode === 'register') {
        setAuthModalMode('admin');
        setAuthError(
          'Este e-mail já é um administrador oficial. Informe sua senha para acessar o painel.'
        );
        return;
      }
      await handleAdminLogin(e);
      return;
    }

    if (authModalMode === 'register') {
      if (cleanName.length < 2) {
        setAuthError('Informe seu nome completo.');
        return;
      }
      const strongRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongRegex.test(authForm.password)) {
        setAuthError(
          'Por segurança, a senha deve ter no mínimo 8 caracteres, 1 letra maiúscula e 1 número.'
        );
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        setAuthError('As senhas digitadas não coincidem.');
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (auth) {
        if (authModalMode === 'register') {
          const cred = await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            authForm.password
          );
          await updateProfile(cred.user, { displayName: cleanName });
          if (db) {
            await setDoc(doc(db, 'artifacts', appId, 'users', cred.user.uid, 'profile', 'data'), {
              uid: cred.user.uid,
              name: cleanName,
              email: cleanEmail,
              createdAt: new Date().toISOString(),
              authMethod: 'email',
              role: 'customer',
            });
          }
          setCustomerProfile({
            uid: cred.user.uid,
            name: cleanName,
            email: cleanEmail,
            provider: 'password',
            role: 'customer',
          });
          showToast('Conta criada com sucesso! Seja bem-vindo(a).');
        } else {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, authForm.password);
          showToast(`Bem-vindo(a) de volta, ${cred.user.displayName || 'Cliente'}!`);
        }
      } else {
        // Fallback seguro quando executado em ambiente local sem credenciais externas
        const localUid = 'local_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
        const profile = {
          uid: localUid,
          name: cleanName || cleanEmail.split('@')[0],
          email: cleanEmail,
          provider: 'password',
          role: 'customer',
        };
        setCustomerProfile(profile);
        showToast(`Acesso realizado como ${profile.name}!`);
      }

      setIsAdminAuthenticated(false);
      setIsAccountModalOpen(false);
      setActiveView('account');
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está cadastrado. Faça login na aba Entrar.');
      } else if (
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/wrong-password' ||
        err?.code === 'auth/user-not-found'
      ) {
        setAuthError('E-mail ou senha incorretos.');
      } else {
        setAuthError('Não foi possível autenticar. Verifique os dados informados.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (Date.now() < adminLockUntil) {
      const remaining = Math.ceil((adminLockUntil - Date.now()) / 1000);
      setAuthError(`Muitas tentativas. Aguarde ${remaining} segundos para tentar novamente.`);
      return;
    }

    setAuthLoading(true);
    try {
      const cleanAdminEmail = sanitizeText(authForm.email).toLowerCase();
      const isValid = await verifyOwnerCredentials(cleanAdminEmail, authForm.password);
      if (!isValid) {
        const nextAttempts = failedAdminAttempts + 1;
        setFailedAdminAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setAdminLockUntil(Date.now() + 60000);
          setAuthError('Acesso temporariamente bloqueado por 60 segundos por segurança.');
        } else {
          setAuthError('E-mail ou senha administrativa incorretos.');
        }
        return;
      }

      setFailedAdminAttempts(0);
      setIsAdminAuthenticated(true);
      const ownerUid = `owner_${cleanAdminEmail.replace(/[^a-z0-9]/g, '_')}`;

      if (db) {
        try {
          await setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'admins', ownerUid),
            {
              uid: ownerUid,
              email: cleanAdminEmail,
              role: 'owner',
              lastAccessAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch {}
      }

      setCustomerProfile({
        uid: ownerUid,
        name: 'Proprietária Cybele Imports',
        email: cleanAdminEmail,
        role: 'owner',
      });
      try {
        sessionStorage.setItem('cybele_owner_session', 'active');
        localStorage.setItem('cybele_owner_email', cleanAdminEmail);
      } catch {}
      setIsAccountModalOpen(false);
      setActiveView('admin');
      setAdminTab('products');
      setAuthForm({ name: '', email: '', password: '', confirmPassword: '' });
      showToast('Acesso administrativo autenticado com sucesso.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch {}
    setIsAdminAuthenticated(false);
    setCustomerProfile(null);
    try {
      sessionStorage.removeItem('cybele_owner_session');
    } catch {}
    setActiveView('store');
    showToast('Sessão encerrada com segurança.');
  };

  // =========================================================================
  // GERENCIAMENTO DE PRODUTOS (PROPRIETÁRIA + BANCO DE DADOS EM TEMPO REAL)
  // =========================================================================
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setProductForm((prev) => ({ ...prev, image: compressed }));
      showToast('Fotografia carregada e otimizada.');
    } catch {
      showToast('Não foi possível processar a imagem.', 'error');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdminAuthenticated) return;

    const cleanName = sanitizeText(productForm.name);
    const cleanDesc = sanitizeText(productForm.description);
    const numericPrice = parseFloat(String(productForm.price).replace(',', '.'));
    const numericPromo = productForm.promoPrice
      ? parseFloat(String(productForm.promoPrice).replace(',', '.'))
      : null;
    const numericStock = Math.max(0, parseInt(productForm.stock, 10) || 0);

    if (!cleanName || isNaN(numericPrice) || numericPrice <= 0) {
      showToast('Preencha o nome e um preço válido para o produto.', 'error');
      return;
    }

    const productId = editingProductId || `prod_${Date.now()}`;
    const payload = {
      id: productId,
      name: cleanName,
      description: cleanDesc,
      price: numericPrice,
      promoPrice: numericPromo && numericPromo > 0 ? numericPromo : null,
      stock: numericStock,
      category: productForm.category,
      image: sanitizeText(productForm.image),
      isFeatured: Boolean(productForm.isFeatured),
      isNew: Boolean(productForm.isNew),
      isBestSeller: Boolean(productForm.isBestSeller),
      createdAt: editingProductId
        ? products.find((p) => p.id === editingProductId)?.createdAt || Date.now()
        : Date.now(),
      updatedAt: Date.now(),
    };

    if (db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'products', productId),
          payload
        );
      } catch (err) {
        console.error('Erro ao salvar produto na nuvem:', err);
      }
    }

    setProducts((prev) => {
      const exists = prev.some((p) => p.id === productId);
      if (exists) {
        return prev.map((p) => (p.id === productId ? payload : p));
      }
      return [payload, ...prev];
    });

    setEditingProductId(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      promoPrice: '',
      stock: '1',
      category: 'Perfumes',
      image: '',
      isFeatured: true,
      isNew: true,
      isBestSeller: false,
    });
    showToast(
      editingProductId
        ? 'Produto atualizado na vitrine!'
        : 'Produto publicado na loja em tempo real!'
    );
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price || ''),
      promoPrice: product.promoPrice ? String(product.promoPrice) : '',
      stock: String(product.stock ?? 0),
      category: product.category || 'Perfumes',
      image: product.image || '',
      isFeatured: Boolean(product.isFeatured),
      isNew: Boolean(product.isNew),
      isBestSeller: Boolean(product.isBestSeller),
    });
    setAdminTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId) => {
    if (!isAdminAuthenticated) return;
    if (db) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', productId));
      } catch {}
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
    showToast('Produto removido do catálogo.');
  };

  // =========================================================================
  // FILTRAGEM DO CATÁLOGO
  // =========================================================================
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory === 'Ofertas') {
        if (!product.promoPrice || product.promoPrice >= product.price) return false;
      } else if (selectedCategory !== 'Todos' && product.category !== selectedCategory) {
        return false;
      }

      if (editorialFilter === 'featured' && !product.isFeatured) return false;
      if (editorialFilter === 'new' && !product.isNew) return false;
      if (editorialFilter === 'bestseller' && !product.isBestSeller) return false;
      if (
        editorialFilter === 'promo' &&
        (!product.promoPrice || product.promoPrice >= product.price)
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name?.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        const matchCat = product.category?.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [products, selectedCategory, editorialFilter, searchQuery]);

  // =========================================================================
  // LÓGICA DO CARRINHO DE COMPRAS & CÁLCULOS
  // =========================================================================
  const addToCart = (product, qty = 1) => {
    if (!product || product.stock <= 0) {
      showToast('Este item está temporariamente esgotado.', 'error');
      return;
    }

    const effectivePrice =
      product.promoPrice && product.promoPrice < product.price
        ? product.promoPrice
        : product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + qty);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: nextQty, price: effectivePrice, stock: product.stock }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: effectivePrice,
          image: product.image,
          category: product.category,
          stock: product.stock,
          quantity: Math.min(product.stock, qty),
        },
      ];
    });

    showToast(`${product.name} adicionado à sacola.`);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== productId) return item;
          const productInStore = products.find((p) => p.id === productId);
          const maxStock = productInStore ? productInStore.stock : item.stock;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return { ...item, quantity: Math.min(maxStock, nextQty) };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleApplyCoupon = () => {
    const code = sanitizeText(couponInput).toUpperCase();
    const found = coupons.find((c) => c.active && c.code.toUpperCase() === code);
    if (found) {
      setAppliedCoupon(found);
      showToast(`Cupom ${found.code} aplicado (${found.discountPercent}% OFF)!`);
    } else {
      showToast('Cupom inválido ou expirado.', 'error');
    }
  };

  const cartItemsCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return (subtotal * appliedCoupon.discountPercent) / 100;
  }, [subtotal, appliedCoupon]);

  const shippingCost = useMemo(() => {
    if (cart.length === 0 || deliveryMethod === 'pickup') return 0;
    if (subtotal - discountAmount >= shippingConfig.freeShippingMin) return 0;
    return Number(shippingConfig.flatRate) || 0;
  }, [cart.length, deliveryMethod, subtotal, discountAmount, shippingConfig]);

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  // =========================================================================
  // MOTOR DE NOTIFICAÇÕES INDIVIDUAIS POR E-MAIL (ADMINISTRADORAS + CLIENTE)
  // =========================================================================
  const dispatchOrderEmailNotifications = async ({ order, eventType, statusLabel }) => {
    const formattedDateTime = new Date().toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const formattedAddress =
      order.deliveryMethod === 'pickup'
        ? 'Retirada Combinada via WhatsApp'
        : `${order.customer.address}, Nº ${order.customer.number}${
            order.customer.complement ? ` (${order.customer.complement})` : ''
          } — CEP ${order.customer.cep}`;

    const paymentLabel =
      order.paymentMethod === 'pix' ? 'PIX Instantâneo' : 'Cartão de Crédito';

    const itemsSummaryText = order.items
      .map((item) => `• ${item.quantity}x ${item.name} — ${formatCurrency(item.total)}`)
      .join('\n');

    const subjectPrefix =
      eventType === 'PAYMENT_APPROVED'
        ? '[PAGAMENTO CONFIRMADO]'
        : '[NOVO PEDIDO RECEBIDO]';

    const createdNotifications = [];

    // 1. Disparo individual para cada administradora cadastrada
    for (const adminRecipient of STORE_CONFIG.adminNotificationRecipients) {
      const notifId = `mail_${order.orderNumber}_${adminRecipient.email.replace(
        /[^a-z0-9]/gi,
        '_'
      )}_${Date.now()}`;

      const subject = `${subjectPrefix} ETIQUETA DE ENVIO ${order.orderNumber} — ${order.customer.fullName}`;
      const shippingLabelBlock =
        order.deliveryMethod === 'pickup'
          ? [
              `==================================================`,
              `ETIQUETA DE RETIRADA — CYBELE IMPORTS`,
              `==================================================`,
              `PEDIDO: ${order.orderNumber}`,
              `DESTINATÁRIO: ${order.customer.fullName}`,
              `TELEFONE / WHATSAPP: ${order.customer.phone}`,
              `E-MAIL: ${order.customer.email}`,
              `MODALIDADE: Retirada Combinada via WhatsApp`,
              `CONTEÚDO:\n${itemsSummaryText}`,
              `VALOR TOTAL: ${formatCurrency(order.total)}`,
              `PAGAMENTO: ${paymentLabel} (${statusLabel || order.paymentStatus})`,
              `DATA/HORA: ${formattedDateTime}`,
              `==================================================`,
            ].join('\n')
          : [
              `==================================================`,
              `ETIQUETA DE ENVIO — CYBELE IMPORTS`,
              `==================================================`,
              `PEDIDO: ${order.orderNumber}`,
              `DESTINATÁRIO: ${order.customer.fullName}`,
              order.customer.cpf ? `CPF: ${order.customer.cpf}` : null,
              `TELEFONE / WHATSAPP: ${order.customer.phone}`,
              `ENDEREÇO: ${order.customer.address}, Nº ${order.customer.number}`,
              order.customer.complement ? `COMPLEMENTO: ${order.customer.complement}` : null,
              `CEP: ${order.customer.cep}`,
              `--------------------------------------------------`,
              `CONTEÚDO / DECLARAÇÃO DE ITENS:`,
              itemsSummaryText,
              `--------------------------------------------------`,
              `VALOR TOTAL: ${formatCurrency(order.total)}`,
              `PAGAMENTO: ${paymentLabel} (${statusLabel || order.paymentStatus})`,
              `REMETENTE: CYBELE IMPORTS • WhatsApp +55 15 99786-0198`,
              `DATA/HORA: ${formattedDateTime}`,
              `==================================================`,
            ]
              .filter(Boolean)
              .join('\n');

      const bodyText = [
        `Olá, ${adminRecipient.name}!`,
        `Segue abaixo a etiqueta com os dados completos para postagem/separação:`,
        ``,
        shippingLabelBlock,
      ].join('\n');

      let deliveryState = 'Pronto para envio (Webhook/Resend/EmailJS)';
      if (emailWebhookUrl && emailWebhookUrl.startsWith('http')) {
        try {
          const response = await fetch(emailWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: adminRecipient.email,
              cc: adminRecipient.alternateEmail || undefined,
              recipientName: adminRecipient.name,
              subject,
              text: bodyText,
              order,
              eventType,
              dateTime: formattedDateTime,
            }),
          });
          deliveryState = response.ok ? 'Enviado via Webhook' : 'Pendente (Falha no Webhook)';
        } catch {
          deliveryState = 'Pendente (Erro de conexão Webhook)';
        }
      }

      const logRecord = {
        id: notifId,
        targetType: 'admin',
        recipientName: adminRecipient.name,
        recipientEmail: adminRecipient.email,
        alternateEmail: adminRecipient.alternateEmail || null,
        orderNumber: order.orderNumber,
        customerName: order.customer.fullName,
        customerCpf: order.customer.cpf || '',
        customerPhone: order.customer.phone,
        customerEmail: order.customer.email,
        deliveryMethod: order.deliveryMethod,
        streetAddress: order.customer.address || '',
        streetNumber: order.customer.number || '',
        complement: order.customer.complement || '',
        cep: order.customer.cep || '',
        items: order.items,
        total: formatCurrency(order.total),
        address: formattedAddress,
        paymentMethod: paymentLabel,
        paymentStatus: statusLabel || order.paymentStatus,
        dateTime: formattedDateTime,
        subject,
        shippingLabelBlock,
        bodyText,
        status: deliveryState,
        timestamp: Date.now(),
      };

      createdNotifications.push(logRecord);

      if (db) {
        try {
          await setDoc(
            doc(db, 'artifacts', appId, 'public', 'data', 'email_notifications', notifId),
            logRecord
          );
        } catch {}
      }
    }

    // 2. Registro de confirmação automática para o cliente
    const customerNotifId = `mail_client_${order.orderNumber}_${Date.now()}`;
    const customerSubject = `CYBELE IMPORTS — Confirmação do Pedido ${order.orderNumber}`;
    const customerBodyText = [
      `Olá, ${order.customer.fullName}!`,
      `Recebemos o seu pedido ${order.orderNumber} na CYBELE IMPORTS.`,
      `Total: ${formatCurrency(order.total)} • Pagamento: ${paymentLabel}`,
      `Situação: ${statusLabel || order.paymentStatus}`,
      `Entrega: ${formattedAddress}`,
    ].join('\n');

    let customerDeliveryState = 'Pronto para envio (Webhook/Resend/EmailJS)';
    if (emailWebhookUrl && emailWebhookUrl.startsWith('http')) {
      try {
        const resClient = await fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.customer.email,
            recipientName: order.customer.fullName,
            subject: customerSubject,
            text: customerBodyText,
            order,
            eventType: 'CUSTOMER_CONFIRMATION',
            dateTime: formattedDateTime,
          }),
        });
        customerDeliveryState = resClient.ok
          ? 'Enviado via Webhook'
          : 'Pendente (Falha no Webhook)';
      } catch {
        customerDeliveryState = 'Pendente (Erro de conexão Webhook)';
      }
    }

    const customerLogRecord = {
      id: customerNotifId,
      targetType: 'customer',
      recipientName: order.customer.fullName,
      recipientEmail: order.customer.email,
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email,
      items: order.items,
      total: formatCurrency(order.total),
      address: formattedAddress,
      paymentMethod: paymentLabel,
      paymentStatus: statusLabel || order.paymentStatus,
      dateTime: formattedDateTime,
      subject: customerSubject,
      bodyText: customerBodyText,
      status: customerDeliveryState,
      timestamp: Date.now() - 1,
    };

    createdNotifications.push(customerLogRecord);

    if (db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'email_notifications', customerNotifId),
          customerLogRecord
        );
      } catch {}
    }

    setEmailLogs((prev) => [...createdNotifications, ...prev]);

    setEmailDispatchPreview({
      recipients: STORE_CONFIG.adminNotificationRecipients.map((r) => r.email),
      customerEmail: cleanEmailFallback(order.customer.email),
      subject: `${subjectPrefix} ${order.orderNumber} — ${formatCurrency(order.total)}`,
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerPhone: order.customer.phone,
      items: order.items,
      total: formatCurrency(order.total),
      address: formattedAddress,
      paymentMethod: paymentLabel,
      paymentStatus: statusLabel || order.paymentStatus,
      dateTime: formattedDateTime,
      notifications: createdNotifications,
    });
  };

  const cleanEmailFallback = (email) => String(email || '').trim().toLowerCase();

  // =========================================================================
  // CHECKOUT SIMPLIFICADO, PEDIDO & NOTIFICAÇÃO ADMINISTRATIVA
  // =========================================================================
  const handleCreateOrder = async (e) => {
    e.preventDefault();

    const cleanCustomer = {
      fullName: sanitizeText(checkoutForm.fullName),
      email: sanitizeText(checkoutForm.email).toLowerCase(),
      phone: sanitizeText(checkoutForm.phone),
      cpf: sanitizeText(checkoutForm.cpf),
      cep: sanitizeText(checkoutForm.cep),
      address: sanitizeText(checkoutForm.address),
      number: sanitizeText(checkoutForm.number),
      complement: sanitizeText(checkoutForm.complement),
    };

    if (
      !cleanCustomer.fullName ||
      !cleanCustomer.email ||
      !cleanCustomer.phone ||
      (deliveryMethod === 'shipping' && (!cleanCustomer.cep || !cleanCustomer.address))
    ) {
      showToast('Preencha todos os campos obrigatórios para entrega.', 'error');
      return;
    }

    const orderNumber = `CYB-${new Date().getFullYear()}-${String(
      Math.floor(1000 + Math.random() * 9000)
    )}`;
    const nowIso = new Date().toISOString();

    const newOrder = {
      id: orderNumber,
      orderNumber,
      customerUid: customerProfile?.uid || null,
      customer: cleanCustomer,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity,
      })),
      subtotal,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      shippingCost,
      deliveryMethod,
      total: grandTotal,
      paymentMethod: checkoutForm.paymentMethod,
      paymentStatus:
        checkoutForm.paymentMethod === 'pix'
          ? 'Aguardando pagamento PIX'
          : 'Aguardando link de pagamento',
      deliveryStatus: 'Aguardando pagamento',
      pixCopyPaste:
        checkoutForm.paymentMethod === 'pix'
          ? buildPixEmvPayload({
              pixKey: STORE_CONFIG.pixKey,
              merchantName: STORE_CONFIG.pixMerchantName,
              merchantCity: STORE_CONFIG.pixMerchantCity,
              amount: grandTotal,
              txid: orderNumber,
            })
          : null,
      webhookVerified: false,
      createdAt: nowIso,
      timestamp: Date.now(),
    };

    // Abate estoque dos itens reservados
    const updatedProducts = products.map((prod) => {
      const orderedItem = cart.find((c) => c.id === prod.id);
      if (!orderedItem) return prod;
      const nextStock = Math.max(0, prod.stock - orderedItem.quantity);
      return { ...prod, stock: nextStock, updatedAt: Date.now() };
    });

    setProducts(updatedProducts);
    setOrders((prev) => [newOrder, ...prev]);

    if (db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderNumber),
          newOrder
        );
        for (const prod of updatedProducts) {
          if (cart.some((c) => c.id === prod.id)) {
            await setDoc(
              doc(db, 'artifacts', appId, 'public', 'data', 'products', prod.id),
              prod
            );
          }
        }
      } catch (err) {
        console.error('Erro ao registrar pedido na nuvem:', err);
      }
    }

    // Dispara notificações individuais por e-mail para cada administradora + cliente
    await dispatchOrderEmailNotifications({
      order: newOrder,
      eventType: 'NEW_ORDER',
      statusLabel: newOrder.paymentStatus,
    });

    setCompletedOrder(newOrder);
    setCart([]);
    setAppliedCoupon(null);
    setCheckoutStep(3);
    showToast(`Pedido ${orderNumber} registrado e notificado às administradoras!`);
  };

  // Simulação de Webhook Autenticado do Mercado Pago (no Painel da Proprietária)
  const handleSimulateMercadoPagoWebhook = async (orderId) => {
    if (!isAdminAuthenticated) return;

    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    const updatedOrder = {
      ...targetOrder,
      paymentStatus: 'Pago (Webhook Validado)',
      deliveryStatus: 'Em separação',
      webhookVerified: true,
      paidAt: new Date().toISOString(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    if (db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId),
          updatedOrder
        );
      } catch {}
    }

    await dispatchOrderEmailNotifications({
      order: updatedOrder,
      eventType: 'PAYMENT_APPROVED',
      statusLabel: 'APROVADO VIA WEBHOOK',
    });

    showToast(`Pagamento do pedido ${orderId} confirmado e notificado por e-mail!`);
  };

  const handleUpdateDeliveryStatus = async (orderId, nextStatus) => {
    if (!isAdminAuthenticated) return;
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;
    const updated = { ...target, deliveryStatus: nextStatus };
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    if (db) {
      try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId), updated);
      } catch {}
    }
    showToast(`Status de entrega atualizado para "${nextStatus}".`);
  };

  const handleSaveStoreSettings = async () => {
    if (!isAdminAuthenticated) return;
    try {
      localStorage.setItem('cybele_email_webhook_v1', emailWebhookUrl.trim());
    } catch {}
    if (db) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'store'),
          {
            coupons,
            shippingConfig,
            emailWebhookUrl: emailWebhookUrl.trim(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      } catch {}
    }
    showToast('Configurações de frete, cupons e notificações salvas!');
  };

  const handleMarkNotificationStatus = async (notifId, nextStatus) => {
    if (!isAdminAuthenticated) return;
    setEmailLogs((prev) =>
      prev.map((item) => (item.id === notifId ? { ...item, status: nextStatus } : item))
    );
    const target = emailLogs.find((item) => item.id === notifId);
    if (db && target) {
      try {
        await setDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'email_notifications', notifId),
          { ...target, status: nextStatus }
        );
      } catch {}
    }
    showToast(`Status da notificação atualizado para "${nextStatus}".`);
  };

  // Métricas do Dashboard Administrativo
  const adminMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => !o.webhookVerified).length;
    const approvedOrders = orders.filter((o) => o.webhookVerified).length;
    const totalSales = orders
      .filter((o) => o.webhookVerified)
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      totalSales,
      totalProducts: products.length,
    };
  }, [orders, products]);

  // Pedidos do Cliente Autenticado
  const customerOrders = useMemo(() => {
    if (!customerProfile) return [];
    return orders.filter(
      (o) =>
        o.customerUid === customerProfile.uid ||
        o.customer?.email?.toLowerCase() === customerProfile.email?.toLowerCase()
    );
  }, [orders, customerProfile]);

  const scrollToCatalog = (category = 'Todos', editorial = 'all') => {
    setActiveView('store');
    setSelectedCategory(category);
    setEditorialFilter(editorial);
    setTimeout(() => {
      catalogSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // =========================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#39291F] font-sans antialiased selection:bg-[#E5D5C0] selection:text-[#39291F]">
      {/* Tipografia Editorial Refinada */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-editorial { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Notificação Flutuante (Toast) */}
      {toast && (
        <div className="fixed top-20 right-4 z-[90] max-w-sm animate-fade-in">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-full shadow-xl border backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-[#39291F] text-[#FFFFFF] border-[#E5D5C0]/30'
                : 'bg-[#39291F] text-[#F3EBDD] border-[#E5D5C0]/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#E5D5C0] shrink-0" />
            <span className="text-xs font-medium tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Barra Superior Discreta */}
      <div className="bg-[#39291F] text-[#F3EBDD] text-[11px] tracking-[0.18em] uppercase py-2.5 px-4 text-center">
        <span>Curadoria Internacional • Paraguai, Argentina &amp; Destinos Exclusivos</span>
      </div>

      {/* Cabeçalho Principal */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5D5C0]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Menu Esquerdo */}
          <nav className="hidden lg:flex items-center gap-7 text-xs tracking-[0.15em] uppercase text-[#70513D]">
            <button
              onClick={() => {
                setActiveView('store');
                setSelectedCategory('Todos');
                setEditorialFilter('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#39291F] transition-colors font-medium"
            >
              Início
            </button>
            <button
              onClick={() => scrollToCatalog('Todos', 'all')}
              className="hover:text-[#39291F] transition-colors font-medium"
            >
              Catálogo
            </button>
            <button
              onClick={() => scrollToCatalog('Perfumes', 'all')}
              className="hover:text-[#39291F] transition-colors"
            >
              Perfumes
            </button>
            <button
              onClick={() => scrollToCatalog('Ofertas', 'promo')}
              className="hover:text-[#39291F] transition-colors"
            >
              Ofertas
            </button>
          </nav>

          {/* Logotipo Central */}
          <button
            onClick={() => {
              setActiveView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center justify-center text-center group"
          >
            <span className="font-editorial text-2xl sm:text-3xl tracking-[0.22em] font-semibold text-[#39291F] leading-none">
              CYBELE IMPORTS
            </span>
            <span className="text-[9px] tracking-[0.35em] text-[#77716B] uppercase mt-1">
              {STORE_CONFIG.subtitle}
            </span>
          </button>

          {/* Ações Direita: Busca, Conta/Perfil e Sacola */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Campo de Pesquisa Suave */}
            <div className="hidden md:flex items-center bg-[#F3EBDD]/70 border border-[#E5D5C0] rounded-full px-3.5 py-1.5 w-48 lg:w-56 focus-within:bg-[#FFFFFF] focus-within:border-[#70513D] transition-all">
              <Search className="w-3.5 h-3.5 text-[#77716B] mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeView !== 'store') setActiveView('store');
                }}
                placeholder="Buscar importados..."
                className="bg-transparent text-xs text-[#39291F] placeholder-[#77716B] focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#77716B] hover:text-[#39291F]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botão Diferenciado: Proprietária vs Cliente */}
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setActiveView(activeView === 'admin' ? 'store' : 'admin');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (customerProfile) {
                  setActiveView(activeView === 'account' ? 'store' : 'account');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setAuthModalMode('login');
                  setAuthError('');
                  setIsAccountModalOpen(true);
                }
              }}
              className={`p-2.5 rounded-full transition-all flex items-center gap-2 ${
                isAdminAuthenticated
                  ? 'bg-[#39291F] text-[#E5D5C0] border border-[#E5D5C0]/40 px-3.5 shadow-sm'
                  : customerProfile
                  ? 'bg-[#F3EBDD] text-[#39291F] border border-[#70513D]/25 px-3.5'
                  : 'text-[#39291F] hover:bg-[#F3EBDD]/80'
              }`}
              title={
                isAdminAuthenticated
                  ? 'Proprietária — Painel Administrativo'
                  : customerProfile
                  ? 'Cliente — Minha Conta'
                  : 'Entrar na Conta'
              }
              aria-label="Conta e Perfil"
            >
              {customerProfile?.photoURL ? (
                <img
                  src={customerProfile.photoURL}
                  alt={customerProfile.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : isAdminAuthenticated ? (
                <ShieldCheck className="w-4 h-4 text-[#E5D5C0]" />
              ) : (
                <User className="w-5 h-5 stroke-[1.5]" />
              )}
              <span className="hidden sm:inline text-[10px] tracking-widest uppercase font-medium">
                {isAdminAuthenticated
                  ? activeView === 'admin'
                    ? 'Ver Vitrine'
                    : 'Proprietária • Painel'
                  : customerProfile
                  ? `Cliente • ${customerProfile.name.split(' ')[0]}`
                  : 'Entrar'}
              </span>
            </button>

            {/* Botão Sacola */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full text-[#39291F] hover:bg-[#F3EBDD]/80 transition-colors"
              aria-label="Sacola de Compras"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#39291F] text-[#FFFFFF] text-[10px] font-semibold flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Barra de Pesquisa Mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="flex items-center bg-[#F3EBDD]/70 border border-[#E5D5C0] rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-[#77716B] mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'store') setActiveView('store');
              }}
              placeholder="Pesquisar perfumes, cosméticos, relógios..."
              className="bg-transparent text-xs text-[#39291F] placeholder-[#77716B] focus:outline-none w-full"
            />
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* VIEW 1: PAINEL DA PROPRIETÁRIA (PROTEGIDO E ISOLADO)                */}
      {/* =================================================================== */}
      {activeView === 'admin' && isAdminAuthenticated && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Cabeçalho do Painel Administrativo */}
          <div className="bg-[#39291F] text-[#F3EBDD] rounded-[2.25rem] p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="px-3 py-0.5 rounded-full bg-[#E5D5C0] text-[#39291F] font-semibold text-[10px] tracking-[0.2em] uppercase">
                  Proprietária
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFFFFF]/10 text-[10px] text-[#E5D5C0]">
                  <Database className="w-3 h-3" />
                  {dbSyncStatus === 'synced'
                    ? 'Banco de Dados Sincronizado'
                    : 'Armazenamento Ativo'}
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl text-[#FFFFFF]">
                Painel Administrativo — Cybele Imports
              </h1>
              <p className="text-xs text-[#E5D5C0]/80 mt-1">
                Notificações individuais automáticas enviadas para{' '}
                <strong className="text-[#FFFFFF]">iranhigorpanizzon@gmail.com</strong> e{' '}
                <strong className="text-[#FFFFFF]">cibellefogaca@gamil.com</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveView('store')}
                className="px-5 py-2.5 rounded-full bg-[#F3EBDD] text-[#39291F] text-xs font-medium tracking-wider uppercase hover:bg-[#FFFFFF] transition-colors"
              >
                Ver Loja
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full border border-[#E5D5C0]/40 text-[#F3EBDD] text-xs font-medium tracking-wider uppercase hover:bg-[#FFFFFF]/10 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>

          {/* KPIs / Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-[#77716B]">
                Pedidos Recebidos
              </p>
              <p className="font-editorial text-3xl font-semibold text-[#39291F] mt-1">
                {adminMetrics.totalOrders}
              </p>
            </div>
            <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-[#77716B]">
                Pedidos Pendentes
              </p>
              <p className="font-editorial text-3xl font-semibold text-[#70513D] mt-1">
                {adminMetrics.pendingOrders}
              </p>
            </div>
            <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-[#77716B]">
                Pagamentos Aprovados
              </p>
              <p className="font-editorial text-3xl font-semibold text-[#39291F] mt-1">
                {adminMetrics.approvedOrders}
              </p>
            </div>
            <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-[#77716B]">Total de Vendas</p>
              <p className="font-editorial text-2xl sm:text-3xl font-semibold text-[#39291F] mt-1">
                {formatCurrency(adminMetrics.totalSales)}
              </p>
            </div>
            <div className="col-span-2 lg:col-span-1 bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5">
              <p className="text-[11px] uppercase tracking-wider text-[#77716B]">
                Produtos Ativos
              </p>
              <p className="font-editorial text-3xl font-semibold text-[#39291F] mt-1">
                {adminMetrics.totalProducts}
              </p>
            </div>
          </div>

          {/* Abas do Painel */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setAdminTab('products')}
              className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium transition-all ${
                adminTab === 'products'
                  ? 'bg-[#39291F] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#F3EBDD] text-[#70513D] hover:bg-[#E5D5C0]'
              }`}
            >
              + Adicionar / Gerenciar Produtos ({products.length})
            </button>
            <button
              onClick={() => setAdminTab('orders')}
              className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium transition-all ${
                adminTab === 'orders'
                  ? 'bg-[#39291F] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#F3EBDD] text-[#70513D] hover:bg-[#E5D5C0]'
              }`}
            >
              Pedidos &amp; Pagamentos ({orders.length})
            </button>
            <button
              onClick={() => setAdminTab('settings')}
              className={`px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium transition-all ${
                adminTab === 'settings'
                  ? 'bg-[#39291F] text-[#FFFFFF] shadow-sm'
                  : 'bg-[#F3EBDD] text-[#70513D] hover:bg-[#E5D5C0]'
              }`}
            >
              Cupons &amp; Frete
            </button>
          </div>

          {/* ABA PRODUTOS */}
          {adminTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Formulário de Cadastro/Edição */}
              <div className="lg:col-span-5 bg-[#F3EBDD]/45 border border-[#E5D5C0] rounded-[2rem] p-6 sm:p-8 h-fit">
                <h2 className="font-editorial text-2xl text-[#39291F] mb-1">
                  {editingProductId ? 'Editar Produto' : 'Cadastrar Novo Produto'}
                </h2>
                <p className="text-xs text-[#77716B] mb-6">
                  Adicione fotografias, valores reais e estoque. A vitrine atualiza na hora.
                </p>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  {/* Upload ou URL da Foto */}
                  <div>
                    <label className="block text-xs font-medium text-[#39291F] mb-2">
                      Fotografia do Produto
                    </label>
                    <div className="flex flex-col gap-3">
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl border-2 border-dashed border-[#70513D]/35 bg-[#FFFFFF] hover:bg-[#F3EBDD]/50 transition-colors text-xs font-medium text-[#70513D]">
                        <Upload className="w-4 h-4" />
                        <span>Escolher Foto do Celular / Computador</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, image: e.target.value }))
                        }
                        placeholder="Ou cole o link (URL) da fotografia..."
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                      />
                    </div>
                    {productForm.image && (
                      <div className="mt-3 relative w-28 h-28 rounded-2xl overflow-hidden border border-[#E5D5C0] bg-[#FFFFFF]">
                        <img
                          src={productForm.image}
                          alt="Prévia"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[#39291F]/80 text-[#FFFFFF]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Ex: Perfume Importado Eau de Parfum"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                      Descrição Detalhada
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Notas olfativas, especificações, origem ou detalhes..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                        Preço (R$) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, price: e.target.value }))
                        }
                        placeholder="0,00"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                        Preço Promocional (Opcional)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={productForm.promoPrice}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, promoPrice: e.target.value }))
                        }
                        placeholder="0,00"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                        Categoria
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                      >
                        {CATEGORIES.filter((c) => c.id !== 'Todos' && c.id !== 'Ofertas').map(
                          (cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.id}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#39291F] mb-1.5">
                        Estoque Disponível
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={productForm.stock}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, stock: e.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs focus:outline-none focus:border-[#70513D]"
                      />
                    </div>
                  </div>

                  {/* Destaques na Vitrine */}
                  <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#39291F]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, isFeatured: e.target.checked }))
                        }
                        className="rounded accent-[#39291F]"
                      />
                      <span>Destaque</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isNew}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, isNew: e.target.checked }))
                        }
                        className="rounded accent-[#39291F]"
                      />
                      <span>Novidade</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.isBestSeller}
                        onChange={(e) =>
                          setProductForm((prev) => ({ ...prev, isBestSeller: e.target.checked }))
                        }
                        className="rounded accent-[#39291F]"
                      />
                      <span>Mais Vendido</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3.5 px-6 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs font-medium uppercase tracking-widest hover:bg-[#70513D] transition-colors"
                    >
                      {editingProductId ? 'Salvar Alterações' : 'Publicar na Vitrine'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(null);
                          setProductForm({
                            name: '',
                            description: '',
                            price: '',
                            promoPrice: '',
                            stock: '1',
                            category: 'Perfumes',
                            image: '',
                            isFeatured: true,
                            isNew: true,
                            isBestSeller: false,
                          });
                        }}
                        className="py-3.5 px-5 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] text-[#39291F] text-xs uppercase tracking-wider"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Lista de Produtos Cadastrados */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-editorial text-2xl text-[#39291F]">
                    Produtos Cadastrados ({products.length})
                  </h2>
                </div>

                {products.length === 0 ? (
                  <div className="bg-[#F3EBDD]/40 border border-[#E5D5C0] rounded-[2rem] p-10 text-center">
                    <Package className="w-10 h-10 text-[#70513D] mx-auto mb-3 stroke-[1.5]" />
                    <p className="font-editorial text-2xl text-[#39291F]">
                      Nenhum produto cadastrado ainda
                    </p>
                    <p className="text-xs text-[#77716B] mt-1">
                      Utilize o formulário ao lado para publicar seus primeiros itens na vitrine.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-3xl p-4 flex items-center justify-between gap-4 shadow-xs"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-16 h-16 rounded-2xl bg-[#F3EBDD] overflow-hidden shrink-0 flex items-center justify-center">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Sparkles className="w-5 h-5 text-[#70513D]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] uppercase tracking-wider text-[#77716B]">
                              {product.category} • Estoque: {product.stock}
                            </span>
                            <h3 className="font-medium text-sm text-[#39291F] truncate">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5 text-xs">
                              {product.promoPrice && product.promoPrice < product.price ? (
                                <>
                                  <span className="font-semibold text-[#39291F]">
                                    {formatCurrency(product.promoPrice)}
                                  </span>
                                  <span className="line-through text-[#77716B]">
                                    {formatCurrency(product.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-semibold text-[#39291F]">
                                  {formatCurrency(product.price)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="p-2.5 rounded-full bg-[#F3EBDD] text-[#39291F] hover:bg-[#E5D5C0] transition-colors"
                            title="Editar produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2.5 rounded-full bg-[#F3EBDD] text-[#70513D] hover:bg-[#39291F] hover:text-[#FFFFFF] transition-colors"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA PEDIDOS & PAGAMENTOS */}
          {adminTab === 'orders' && (
            <div className="space-y-6">
              {/* Caixa de Notificações por Administradora */}
              <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-[2rem] p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#39291F]">
                      <Mail className="w-4 h-4 text-[#70513D]" />
                      Caixa de Notificações Individuais por Administradora
                    </div>
                    <p className="text-xs text-[#77716B] mt-1">
                      Cada pedido gera automaticamente uma etiqueta de envio/retirada individual para
                      cada administradora e confirmação para o cliente.
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full bg-[#39291F] text-[#E5D5C0] text-[10px] uppercase tracking-wider font-medium self-start">
                    {emailLogs.length} registro(s) de e-mail
                  </span>
                </div>

                {/* Resumo por Administradora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {STORE_CONFIG.adminNotificationRecipients.map((adminRec) => {
                    const adminSpecificLogs = emailLogs.filter(
                      (log) => log.recipientEmail === adminRec.email
                    );
                    const latestLog = adminSpecificLogs[0];
                    return (
                      <div
                        key={adminRec.email}
                        className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-3xl p-5 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div>
                            <p className="text-xs font-semibold text-[#39291F]">{adminRec.name}</p>
                            <p className="text-[11px] text-[#70513D]">{adminRec.email}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#F3EBDD] text-[#39291F] text-[10px] font-medium">
                            {adminSpecificLogs.length} e-mail(s)
                          </span>
                        </div>
                        {latestLog ? (
                          <div className="mt-3 pt-3 border-t border-[#F3EBDD] text-[11px] space-y-1 text-[#77716B]">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[#39291F]">
                                Último: {latestLog.orderNumber} ({latestLog.total})
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-[#39291F] text-[#E5D5C0] text-[10px]">
                                {latestLog.status}
                              </span>
                            </div>
                            <p>
                              Cliente: {latestLog.customerName} • {latestLog.dateTime}
                            </p>
                          </div>
                        ) : (
                          <p className="mt-3 pt-3 border-t border-[#F3EBDD] text-[11px] text-[#77716B]">
                            Aguardando o próximo pedido para disparo automático.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Lista Detalhada de Notificações Disparadas em Formato de Etiqueta */}
                {emailLogs.length > 0 && (
                  <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
                    {emailLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-3xl p-5 text-xs space-y-3 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3EBDD]">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                log.targetType === 'admin'
                                  ? 'bg-[#39291F] text-[#E5D5C0]'
                                  : 'bg-[#F3EBDD] text-[#70513D]'
                              }`}
                            >
                              {log.targetType === 'admin' ? 'Administradora' : 'Cliente'}
                            </span>
                            <strong className="text-[#39291F]">{log.recipientEmail}</strong>
                            <span className="text-[#77716B]">• {log.dateTime}</span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={log.status}
                              onChange={(e) => handleMarkNotificationStatus(log.id, e.target.value)}
                              className="px-3 py-1 rounded-full bg-[#F3EBDD] text-[#39291F] text-[11px] border border-[#E5D5C0]"
                            >
                              <option value="Enviado via Webhook">Enviado</option>
                              <option value="Pronto para envio (Webhook/Resend/EmailJS)">
                                Pronto para envio (Webhook/Resend/EmailJS)
                              </option>
                              <option value="Pendente">Pendente</option>
                            </select>
                            {log.shippingLabelBlock && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(log.shippingLabelBlock);
                                  showToast('Etiqueta de envio copiada!');
                                }}
                                className="px-3 py-1 rounded-full bg-[#F3EBDD] text-[#39291F] border border-[#E5D5C0] text-[10px] uppercase tracking-wider font-medium hover:bg-[#E5D5C0]"
                              >
                                Copiar Etiqueta
                              </button>
                            )}
                            <a
                              href={`mailto:${encodeURIComponent(
                                log.recipientEmail
                              )}?subject=${encodeURIComponent(
                                log.subject
                              )}&body=${encodeURIComponent(log.bodyText || '')}`}
                              className="px-3 py-1 rounded-full bg-[#39291F] text-[#FFFFFF] text-[10px] uppercase tracking-wider hover:bg-[#70513D]"
                            >
                              Enviar E-mail
                            </a>
                          </div>
                        </div>

                        {/* Visualização em Formato de Etiqueta de Envio */}
                        {log.targetType === 'admin' ? (
                          <div className="rounded-2xl border-2 border-dashed border-[#70513D]/45 bg-[#F3EBDD]/35 p-4 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5D5C0] pb-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#70513D]">
                                  {log.deliveryMethod === 'pickup'
                                    ? 'Etiqueta de Retirada'
                                    : 'Etiqueta de Envio / Postagem'}
                                </span>
                                <p className="font-editorial text-lg font-semibold text-[#39291F]">
                                  CYBELE IMPORTS • Pedido {log.orderNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="px-2.5 py-1 rounded-full bg-[#39291F] text-[#E5D5C0] text-[10px] font-semibold">
                                  {log.total}
                                </span>
                                <p className="text-[10px] text-[#77716B] mt-1">
                                  {log.paymentMethod} • {log.paymentStatus}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5D5C0]/80 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[#70513D]">
                                  Destinatário
                                </p>
                                <p className="font-semibold text-[#39291F] text-xs">
                                  {log.customerName}
                                </p>
                                {log.customerCpf && (
                                  <p className="text-[#77716B]">CPF: {log.customerCpf}</p>
                                )}
                                <p className="text-[#39291F]">Tel/WhatsApp: {log.customerPhone}</p>
                                <p className="text-[#77716B]">E-mail: {log.customerEmail}</p>
                              </div>

                              <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5D5C0]/80 space-y-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-[#70513D]">
                                  Endereço de Entrega
                                </p>
                                {log.deliveryMethod === 'pickup' ? (
                                  <p className="font-medium text-[#39291F]">
                                    Retirada Combinada via WhatsApp
                                  </p>
                                ) : (
                                  <>
                                    <p className="font-medium text-[#39291F]">
                                      {log.streetAddress
                                        ? `${log.streetAddress}, Nº ${log.streetNumber}`
                                        : log.address}
                                    </p>
                                    {log.complement && (
                                      <p className="text-[#77716B]">
                                        Complemento: {log.complement}
                                      </p>
                                    )}
                                    {log.cep && (
                                      <p className="font-semibold text-[#39291F]">
                                        CEP: {log.cep}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="bg-[#FFFFFF] rounded-xl p-3 border border-[#E5D5C0]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider font-bold text-[#70513D] block">
                                  Conteúdo da Embalagem
                                </span>
                                <span className="text-[#39291F]">
                                  {log.items
                                    ?.map((item) => `${item.quantity}x ${item.name}`)
                                    .join(' • ')}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#77716B] shrink-0">
                                Remetente: CYBELE IMPORTS
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-1 text-[11px] text-[#77716B]">
                            <p>
                              <strong className="text-[#39291F]">Confirmação ao Cliente:</strong>{' '}
                              {log.orderNumber} • {log.total} • {log.paymentMethod} (
                              {log.paymentStatus})
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#F3EBDD]/40 border border-[#E5D5C0] rounded-[2rem] p-12 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#70513D] mx-auto mb-3 stroke-[1.5]" />
                  <p className="font-editorial text-2xl text-[#39291F]">
                    Nenhum pedido registrado ainda
                  </p>
                  <p className="text-xs text-[#77716B] mt-1">
                    Quando um cliente finalizar uma compra, os detalhes e o status do pagamento
                    aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-[2rem] p-6 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F3EBDD]">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-sm text-[#39291F]">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium ${
                                order.webhookVerified
                                  ? 'bg-[#39291F] text-[#E5D5C0]'
                                  : 'bg-[#F3EBDD] text-[#70513D]'
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#77716B] mt-1">
                            Cliente:{' '}
                            <strong className="text-[#39291F]">{order.customer?.fullName}</strong> •{' '}
                            {order.customer?.phone} • {order.customer?.email}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {!order.webhookVerified && (
                            <button
                              onClick={() => handleSimulateMercadoPagoWebhook(order.id)}
                              className="px-4 py-2 rounded-full bg-[#39291F] text-[#FFFFFF] text-[11px] uppercase tracking-wider font-medium hover:bg-[#70513D] transition-colors"
                            >
                              Confirmar Pagamento / Webhook
                            </button>
                          )}
                          <select
                            value={order.deliveryStatus}
                            onChange={(e) => handleUpdateDeliveryStatus(order.id, e.target.value)}
                            className="px-4 py-2 rounded-full bg-[#F3EBDD] text-[#39291F] text-xs border border-[#E5D5C0]"
                          >
                            <option value="Aguardando pagamento">Aguardando pagamento</option>
                            <option value="Em separação">Em separação</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregue">Entregue</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-medium text-[#39291F] mb-1">Itens do Pedido:</p>
                          <ul className="space-y-1 text-[#77716B]">
                            {order.items?.map((item, idx) => (
                              <li key={idx}>
                                {item.quantity}x {item.name} — {formatCurrency(item.total)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="md:text-right">
                          <p className="text-[#77716B]">
                            Entrega:{' '}
                            {order.deliveryMethod === 'pickup'
                              ? 'Retirada combinada'
                              : `${order.customer?.address}, ${order.customer?.number} - CEP ${order.customer?.cep}`}
                          </p>
                          <p className="font-semibold text-sm text-[#39291F] mt-1">
                            Total: {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABA CUPONS & FRETE */}
          {adminTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#F3EBDD]/45 border border-[#E5D5C0] rounded-[2rem] p-6">
                <h3 className="font-editorial text-2xl text-[#39291F] mb-4">
                  Configuração de Frete &amp; Entrega
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#39291F] mb-1">
                      Taxa Fixa de Entrega (R$)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.flatRate}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({
                          ...prev,
                          flatRate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#39291F] mb-1">
                      Frete Grátis a partir de (R$)
                    </label>
                    <input
                      type="number"
                      value={shippingConfig.freeShippingMin}
                      onChange={(e) =>
                        setShippingConfig((prev) => ({
                          ...prev,
                          freeShippingMin: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs"
                    />
                  </div>
                  <button
                    onClick={handleSaveStoreSettings}
                    className="px-6 py-3 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest"
                  >
                    Salvar Configurações
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-[#E5D5C0] space-y-3">
                  <h4 className="font-editorial text-xl text-[#39291F]">
                    Webhook de Disparo Automático de E-mail (Resend / EmailJS / Make)
                  </h4>
                  <p className="text-[11px] text-[#77716B] leading-relaxed">
                    Cole abaixo a URL do seu endpoint/webhook (Resend, Brevo, EmailJS ou Make) para
                    envio automático instantâneo para{' '}
                    <strong>iranhigorpanizzon@gmail.com</strong> e{' '}
                    <strong>cibellefogaca@gamil.com</strong> a cada pedido.
                  </p>
                  <input
                    type="url"
                    value={emailWebhookUrl}
                    onChange={(e) => setEmailWebhookUrl(e.target.value)}
                    placeholder="https://seu-webhook-email.com/api/notify"
                    className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs"
                  />
                  <button
                    onClick={handleSaveStoreSettings}
                    className="px-6 py-2.5 rounded-full bg-[#70513D] text-[#FFFFFF] text-xs uppercase tracking-widest"
                  >
                    Salvar Webhook de E-mail
                  </button>
                </div>
              </div>

              <div className="bg-[#F3EBDD]/45 border border-[#E5D5C0] rounded-[2rem] p-6">
                <h3 className="font-editorial text-2xl text-[#39291F] mb-4">Cupons Promocionais</h3>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="Código (ex: VIP15)"
                    className="flex-1 px-4 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(e.target.value)}
                    className="w-20 px-3 py-2.5 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] text-xs text-center"
                  />
                  <button
                    onClick={() => {
                      if (!newCouponCode.trim()) return;
                      const updated = [
                        ...coupons,
                        {
                          code: newCouponCode.trim().toUpperCase(),
                          discountPercent: Number(newCouponDiscount) || 10,
                          active: true,
                        },
                      ];
                      setCoupons(updated);
                      setNewCouponCode('');
                      showToast('Cupom criado!');
                    }}
                    className="px-5 py-2.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs"
                  >
                    Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {coupons.map((c, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[#FFFFFF] border border-[#E5D5C0] text-xs"
                    >
                      <span>
                        <strong>{c.code}</strong> — {c.discountPercent}% de desconto
                      </span>
                      <button
                        onClick={() => setCoupons(coupons.filter((_, i) => i !== index))}
                        className="text-[#77716B] hover:text-[#39291F]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: PAINEL DO CLIENTE (MINHA CONTA & MEUS PEDIDOS)              */}
      {/* =================================================================== */}
      {activeView === 'account' && customerProfile && !isAdminAuthenticated && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-[#F3EBDD]/65 border border-[#E5D5C0] rounded-[2.25rem] p-6 sm:p-10 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {customerProfile.photoURL ? (
                <img
                  src={customerProfile.photoURL}
                  alt={customerProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#70513D]/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#39291F] text-[#E5D5C0] flex items-center justify-center font-editorial text-2xl">
                  {customerProfile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#FFFFFF] text-[#70513D] text-[10px] uppercase tracking-widest font-medium mb-1">
                  Perfil: Cliente VIP
                </span>
                <h1 className="font-editorial text-3xl text-[#39291F]">{customerProfile.name}</h1>
                <p className="text-xs text-[#77716B]">{customerProfile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('store')}
                className="px-5 py-2.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-wider"
              >
                Voltar à Loja
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-full border border-[#70513D]/30 text-[#39291F] text-xs uppercase tracking-wider hover:bg-[#FFFFFF] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            </div>
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl text-[#39291F] mb-5">
            Meus Pedidos ({customerOrders.length})
          </h2>

          {customerOrders.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-[2rem] p-10 text-center">
              <Package className="w-10 h-10 text-[#70513D] mx-auto mb-3 stroke-[1.5]" />
              <p className="font-editorial text-2xl text-[#39291F]">
                Você ainda não possui pedidos realizados
              </p>
              <p className="text-xs text-[#77716B] mt-1 mb-5">
                Explore nossa seleção de perfumes, cosméticos e acessórios importados.
              </p>
              <button
                onClick={() => scrollToCatalog('Todos', 'all')}
                className="px-7 py-3 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest"
              >
                Explorar Produtos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FFFFFF] border border-[#E5D5C0] rounded-[2rem] p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F3EBDD]">
                    <div>
                      <span className="font-semibold text-sm text-[#39291F]">
                        Pedido {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#77716B] ml-3">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span className="px-3.5 py-1 rounded-full bg-[#F3EBDD] text-[#39291F] text-xs font-medium">
                      {order.deliveryStatus}
                    </span>
                  </div>
                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-[#77716B]">
                      {order.items?.map((i) => `${i.quantity}x ${i.name}`).join(' • ')}
                    </div>
                    <div className="font-semibold text-sm text-[#39291F]">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* =================================================================== */}
      {/* VIEW 3: VITRINE PRINCIPAL (HOMEPAGE EDITORIAL & CATÁLOGO)           */}
      {/* =================================================================== */}
      {activeView === 'store' && (
        <main>
          {/* HERO BANNER EDITORIAL COM FOTOGRAFIA */}
          <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-8">
            <div className="max-w-7xl mx-auto relative overflow-hidden rounded-[2.5rem] bg-[#39291F] text-[#FFFFFF] px-6 py-16 sm:px-14 sm:py-24 lg:py-28 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1800&q=85"
                alt="Perfume de Luxo e Curadoria Internacional Cybele Imports"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#39291F]/95 via-[#39291F]/75 to-[#39291F]/30 pointer-events-none" />

              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#FFFFFF]/15 backdrop-blur-xs border border-[#E5D5C0]/30 text-[#E5D5C0] text-[10px] tracking-[0.25em] uppercase mb-6">
                  Curadoria Exclusiva • Cybele Imports
                </span>
                <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.12] text-[#FFFFFF] mb-6">
                  Descubra o mundo através dos importados.
                </h1>
                <p className="text-sm sm:text-base text-[#F3EBDD]/95 font-light leading-relaxed mb-9 max-w-xl">
                  Produtos selecionados, novidades internacionais e uma experiência de compra
                  especial para você.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => scrollToCatalog('Todos', 'all')}
                    className="px-8 py-4 rounded-full bg-[#FFFFFF] text-[#39291F] text-xs font-semibold tracking-[0.2em] uppercase hover:bg-[#F3EBDD] transition-all shadow-md"
                  >
                    EXPLORAR PRODUTOS
                  </button>
                  <a
                    href={STORE_CONFIG.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-4 rounded-full bg-[#39291F]/50 backdrop-blur-xs border border-[#E5D5C0]/45 text-[#F3EBDD] text-xs tracking-[0.16em] uppercase hover:bg-[#FFFFFF]/15 transition-all"
                  >
                    Atendimento VIP
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* FAIXA DE DIFERENCIAIS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  icon: Sparkles,
                  title: 'Curadoria Internacional',
                  desc: 'Seleção criteriosa de importados',
                },
                {
                  icon: Award,
                  title: 'Origem Garantida',
                  desc: 'Paraguai, Argentina & destinos globais',
                },
                {
                  icon: MessageCircle,
                  title: 'Atendimento Personalizado',
                  desc: 'Consultoria direta via WhatsApp',
                },
                {
                  icon: ShieldCheck,
                  title: 'Compra Segura',
                  desc: 'Checkout protegido e envio ágil',
                },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#F3EBDD]/55 border border-[#E5D5C0]/70 rounded-3xl p-4 sm:p-5 flex items-center gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] flex items-center justify-center shrink-0 text-[#70513D]">
                      <IconComp className="w-4 h-4 stroke-[1.75]" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#39291F]">{item.title}</h3>
                      <p className="text-[11px] text-[#77716B] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* NAVEGAÇÃO POR CATEGORIAS CIRCULARES COM FOTOGRAFIAS */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#77716B]">
                  Departamentos
                </span>
                <h2 className="font-editorial text-3xl text-[#39291F]">Explore por Categoria</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar pb-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setEditorialFilter('all');
                    }}
                    className="flex flex-col items-center gap-2.5 shrink-0 group"
                  >
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden transition-all border-2 ${
                        isSelected
                          ? 'border-[#39291F] ring-4 ring-[#E5D5C0]/70 scale-105 shadow-md'
                          : 'border-[#E5D5C0] group-hover:border-[#70513D]'
                      }`}
                    >
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span
                      className={`text-xs tracking-wide ${
                        isSelected ? 'font-semibold text-[#39291F]' : 'text-[#77716B]'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3 CARDS EDITORIAIS COM FOTOGRAFIA (NOVIDADES, MAIS VENDIDOS, OFERTAS) */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                onClick={() => scrollToCatalog('Todos', 'new')}
                className="relative overflow-hidden text-left rounded-[2rem] bg-[#F3EBDD] border border-[#E5D5C0] p-7 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
              >
                <img
                  src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
                  alt="Novidades Internacionais"
                  className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F3EBDD]/95 via-[#F3EBDD]/80 to-[#F3EBDD]/40" />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#70513D] font-semibold">
                    Lançamentos
                  </span>
                  <h3 className="font-editorial text-3xl text-[#39291F] mt-1">
                    Novidades Internacionais
                  </h3>
                  <p className="text-xs text-[#39291F]/80 mt-2 max-w-[240px]">
                    Recém-chegados selecionados das melhores vitrines internacionais.
                  </p>
                </div>
                <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#39291F] mt-5 group-hover:translate-x-1 transition-transform">
                  Ver Novidades <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => scrollToCatalog('Todos', 'bestseller')}
                className="relative overflow-hidden text-left rounded-[2rem] bg-[#39291F] text-[#FFFFFF] p-7 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
              >
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                  alt="Mais Vendidos"
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#39291F]/95 via-[#39291F]/75 to-[#39291F]/35" />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#E5D5C0] font-semibold">
                    Favoritos
                  </span>
                  <h3 className="font-editorial text-3xl text-[#FFFFFF] mt-1">Mais Vendidos</h3>
                  <p className="text-xs text-[#F3EBDD]/85 mt-2 max-w-[240px]">
                    Os itens mais desejados e recomendados pelas nossas clientes.
                  </p>
                </div>
                <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E5D5C0] mt-5 group-hover:translate-x-1 transition-transform">
                  Explorar Seleção <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => scrollToCatalog('Ofertas', 'promo')}
                className="relative overflow-hidden text-left rounded-[2rem] bg-[#E5D5C0] border border-[#E5D5C0] p-7 hover:shadow-lg transition-all group flex flex-col justify-between min-h-[220px]"
              >
                <img
                  src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80"
                  alt="Ofertas Especiais"
                  className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#E5D5C0]/95 via-[#E5D5C0]/80 to-[#E5D5C0]/40" />
                <div className="relative z-10">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#70513D] font-semibold">
                    Oportunidades
                  </span>
                  <h3 className="font-editorial text-3xl text-[#39291F] mt-1">Ofertas Especiais</h3>
                  <p className="text-xs text-[#39291F]/80 mt-2 max-w-[240px]">
                    Condições exclusivas por tempo limitado em itens selecionados.
                  </p>
                </div>
                <span className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#39291F] mt-5 group-hover:translate-x-1 transition-transform">
                  Conferir Ofertas <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </section>

          {/* VITRINE DE PRODUTOS */}
          <section
            ref={catalogSectionRef}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#77716B]">
                  Vitrine Oficial
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl text-[#39291F]">
                  {selectedCategory === 'Todos'
                    ? editorialFilter === 'new'
                      ? 'Novidades Internacionais'
                      : editorialFilter === 'bestseller'
                      ? 'Produtos Mais Vendidos'
                      : editorialFilter === 'promo'
                      ? 'Ofertas Especiais'
                      : 'Curadoria em Destaque'
                    : selectedCategory}
                </h2>
              </div>

              {(selectedCategory !== 'Todos' || editorialFilter !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('Todos');
                    setEditorialFilter('all');
                    setSearchQuery('');
                  }}
                  className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#F3EBDD] text-[#39291F] text-xs hover:bg-[#E5D5C0] transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-[#F3EBDD]/45 border border-[#E5D5C0] rounded-[2.5rem] p-12 sm:p-16 text-center max-w-3xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] flex items-center justify-center mx-auto mb-5 text-[#70513D]">
                  <Sparkles className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="font-editorial text-3xl text-[#39291F] mb-3">
                  {products.length === 0
                    ? 'Curadoria em Atualização'
                    : 'Nenhum item encontrado com este filtro'}
                </h3>
                <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed max-w-lg mx-auto mb-8">
                  {products.length === 0
                    ? 'Nossa seleção exclusiva de perfumes, cosméticos e acessórios importados está sendo atualizada. Fale conosco pelo WhatsApp para encomendas personalizadas ou novidades disponíveis.'
                    : 'Tente selecionar outra categoria ou limpar a pesquisa para visualizar todos os itens disponíveis.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={STORE_CONFIG.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest font-medium hover:bg-[#70513D] transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar Disponibilidade no WhatsApp
                  </a>
                  {products.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedCategory('Todos');
                        setEditorialFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-6 py-3.5 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] text-[#39291F] text-xs uppercase tracking-widest"
                    >
                      Ver Todos os Produtos
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const hasPromo =
                    product.promoPrice && Number(product.promoPrice) < Number(product.price);
                  const isOutOfStock = Number(product.stock) <= 0;

                  return (
                    <div
                      key={product.id}
                      className="group bg-[#FFFFFF] border border-[#E5D5C0]/80 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Imagem do Produto */}
                      <div
                        onClick={() => setSelectedProductModal(product)}
                        className="relative aspect-[4/5] bg-[#F3EBDD]/50 overflow-hidden cursor-pointer"
                      >
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#70513D]/50">
                            <Sparkles className="w-8 h-8 stroke-[1.25] mb-2" />
                            <span className="text-[10px] uppercase tracking-widest">
                              Cybele Imports
                            </span>
                          </div>
                        )}

                        {/* Selos */}
                        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                          {hasPromo && (
                            <span className="px-3 py-1 rounded-full bg-[#39291F] text-[#FFFFFF] text-[10px] uppercase tracking-wider font-medium">
                              Oferta
                            </span>
                          )}
                          {product.isNew && !hasPromo && (
                            <span className="px-3 py-1 rounded-full bg-[#FFFFFF]/90 text-[#39291F] text-[10px] uppercase tracking-wider font-medium">
                              Novidade
                            </span>
                          )}
                        </div>

                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-[#FFFFFF]/75 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-[10px] uppercase tracking-widest">
                              Esgotado
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#77716B]">
                            {product.category}
                          </span>
                          <h3
                            onClick={() => setSelectedProductModal(product)}
                            className="font-editorial text-xl text-[#39291F] mt-1 cursor-pointer hover:text-[#70513D] transition-colors line-clamp-2"
                          >
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-xs text-[#77716B] mt-1.5 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F3EBDD]">
                          <div className="flex items-baseline gap-2 mb-3">
                            {hasPromo ? (
                              <>
                                <span className="text-base font-semibold text-[#39291F]">
                                  {formatCurrency(product.promoPrice)}
                                </span>
                                <span className="text-xs line-through text-[#77716B]">
                                  {formatCurrency(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-base font-semibold text-[#39291F]">
                                {formatCurrency(product.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              disabled={isOutOfStock}
                              onClick={() => {
                                addToCart(product, 1);
                                setIsCartOpen(false);
                                setCheckoutStep(1);
                                setIsCheckoutOpen(true);
                              }}
                              className="flex-1 py-2.5 px-4 rounded-full bg-[#39291F] text-[#FFFFFF] text-[11px] uppercase tracking-wider font-medium hover:bg-[#70513D] disabled:opacity-40 transition-colors"
                            >
                              Comprar
                            </button>
                            <button
                              disabled={isOutOfStock}
                              onClick={() => addToCart(product, 1)}
                              className="p-2.5 rounded-full bg-[#F3EBDD] text-[#39291F] hover:bg-[#E5D5C0] disabled:opacity-40 transition-colors"
                              title="Adicionar à sacola"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SEÇÃO INSTITUCIONAL & INSTAGRAM */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="bg-[#F3EBDD]/70 border border-[#E5D5C0] rounded-[2.5rem] p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#70513D]">
                  Sobre a Marca
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl text-[#39291F] mt-2 mb-4">
                  Sofisticação e procedência em cada escolha.
                </h2>
                <p className="text-xs sm:text-sm text-[#77716B] leading-relaxed mb-6">
                  A <strong>CYBELE IMPORTS</strong> nasceu com o propósito de aproximar você das
                  melhores tendências internacionais do Paraguai, Argentina e mercados globais.
                  Trabalhamos com curadoria dedicada, atendimento próximo e total transparência do
                  pedido à entrega.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={STORE_CONFIG.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest hover:bg-[#70513D] transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    Seguir {STORE_CONFIG.instagramHandle}
                  </a>
                  <a
                    href={STORE_CONFIG.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] text-[#39291F] text-xs uppercase tracking-widest hover:bg-[#F3EBDD] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#70513D]" />
                    {STORE_CONFIG.whatsappNumber}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-5 relative overflow-hidden bg-[#39291F] text-[#F3EBDD] rounded-[2rem] p-8 min-h-[240px] flex flex-col justify-end">
                <img
                  src="https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=900&q=80"
                  alt="Curadoria Cybele Imports"
                  className="absolute inset-0 w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#39291F]/95 via-[#39291F]/70 to-transparent" />
                <div className="relative z-10">
                  <p className="font-editorial text-2xl text-[#FFFFFF] mb-2">
                    Atendimento Personalizado
                  </p>
                  <p className="text-xs text-[#E5D5C0]/90 leading-relaxed mb-5">
                    Procura uma fragrância específica, cosmético importado ou acessório exclusivo?
                    Fale diretamente com nossa equipe pelo WhatsApp oficial.
                  </p>
                  <div className="space-y-2 text-xs text-[#F3EBDD]">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#E5D5C0]" />
                      <span>{STORE_CONFIG.whatsappNumber}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Instagram className="w-4 h-4 text-[#E5D5C0]" />
                      <span>{STORE_CONFIG.instagramHandle}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =================================================================== */}
      {/* RODAPÉ COMPLETO E SOFISTICADO                                       */}
      {/* =================================================================== */}
      <footer className="bg-[#39291F] text-[#F3EBDD] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <span className="font-editorial text-2xl tracking-[0.22em] text-[#FFFFFF]">
              CYBELE IMPORTS
            </span>
            <p className="text-xs text-[#E5D5C0]/80 mt-3 max-w-md leading-relaxed">
              Produtos selecionados, novidades internacionais e uma experiência de compra especial
              para você. Segurança, procedência e elegância em cada detalhe.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#E5D5C0] font-semibold mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-xs text-[#F3EBDD]/80">
              <li>
                <button
                  onClick={() => scrollToCatalog('Todos', 'all')}
                  className="hover:text-[#FFFFFF]"
                >
                  Catálogo Completo
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToCatalog('Perfumes', 'all')}
                  className="hover:text-[#FFFFFF]"
                >
                  Perfumes Importados
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToCatalog('Cosméticos', 'all')}
                  className="hover:text-[#FFFFFF]"
                >
                  Cosméticos &amp; Beleza
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToCatalog('Ofertas', 'promo')}
                  className="hover:text-[#FFFFFF]"
                >
                  Ofertas Especiais
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[#E5D5C0] font-semibold mb-4">
              Contato &amp; Redes Sociais
            </h4>
            <ul className="space-y-3 text-xs text-[#F3EBDD]/85">
              <li>
                <a
                  href={STORE_CONFIG.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#FFFFFF]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E5D5C0]" />
                  <span>WhatsApp: {STORE_CONFIG.whatsappNumber}</span>
                </a>
              </li>
              <li>
                <a
                  href={STORE_CONFIG.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#FFFFFF]"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#E5D5C0]" />
                  <span>Instagram: {STORE_CONFIG.instagramHandle}</span>
                </a>
              </li>
              <li className="flex items-center gap-2 text-[#E5D5C0]/75">
                <Lock className="w-3.5 h-3.5" />
                <span>Ambiente protegido • LGPD</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E5D5C0]/15 py-5 px-4 text-center text-[11px] text-[#E5D5C0]/60">
          <span
            onClick={() => {
              footerClickCountRef.current += 1;
              if (footerClickCountRef.current >= 3) {
                footerClickCountRef.current = 0;
                if (isAdminAuthenticated) {
                  setActiveView('admin');
                } else {
                  setAuthModalMode('admin');
                  setAuthError('');
                  setIsAccountModalOpen(true);
                }
              }
            }}
            className="cursor-default select-none"
          >
            © {new Date().getFullYear()} CYBELE IMPORTS. Todos os direitos reservados.
          </span>
        </div>
      </footer>

      {/* =================================================================== */}
      {/* BOTÃO FLUTUANTE DE WHATSAPP EM TODAS AS PÁGINAS                     */}
      {/* =================================================================== */}
      <a
        href={STORE_CONFIG.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com Cybele Imports no WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] border border-[#E5D5C0]/40 shadow-2xl hover:bg-[#70513D] transition-all group"
      >
        <MessageCircle className="w-5 h-5 text-[#E5D5C0]" />
        <span className="hidden sm:inline text-xs font-medium tracking-wider">WhatsApp</span>
      </a>

      {/* =================================================================== */}
      {/* MODAL DE DETALHES DO PRODUTO                                        */}
      {/* =================================================================== */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 bg-[#39291F]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[2.25rem] max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E5D5C0]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="aspect-square bg-[#F3EBDD] relative">
                {selectedProductModal.image ? (
                  <img
                    src={selectedProductModal.image}
                    alt={selectedProductModal.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#70513D]">
                    <Sparkles className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#77716B]">
                      {selectedProductModal.category}
                    </span>
                    <button
                      onClick={() => setSelectedProductModal(null)}
                      className="p-1.5 rounded-full bg-[#F3EBDD] text-[#39291F]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl text-[#39291F] mt-2">
                    {selectedProductModal.name}
                  </h3>
                  <p className="text-xs text-[#77716B] mt-3 leading-relaxed">
                    {selectedProductModal.description || 'Produto importado selecionado.'}
                  </p>
                  <p className="text-[11px] text-[#70513D] mt-3">
                    Disponibilidade: <strong>{selectedProductModal.stock} unidade(s)</strong>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F3EBDD]">
                  <div className="mb-4">
                    {selectedProductModal.promoPrice &&
                    selectedProductModal.promoPrice < selectedProductModal.price ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold text-[#39291F]">
                          {formatCurrency(selectedProductModal.promoPrice)}
                        </span>
                        <span className="text-xs line-through text-[#77716B]">
                          {formatCurrency(selectedProductModal.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-semibold text-[#39291F]">
                        {formatCurrency(selectedProductModal.price)}
                      </span>
                    )}
                  </div>

                  <button
                    disabled={selectedProductModal.stock <= 0}
                    onClick={() => {
                      addToCart(selectedProductModal, 1);
                      setSelectedProductModal(null);
                    }}
                    className="w-full py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest font-medium hover:bg-[#70513D] disabled:opacity-40 transition-colors"
                  >
                    {selectedProductModal.stock > 0 ? 'Adicionar à Sacola' : 'Produto Esgotado'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* DRAWER LATERAL: CARRINHO DE COMPRAS PERSISTENTE                     */}
      {/* =================================================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-[#39291F]/55 backdrop-blur-xs flex justify-end">
          <div className="bg-[#FFFFFF] w-full max-w-md h-full flex flex-col justify-between shadow-2xl rounded-l-[2.25rem] overflow-hidden">
            <div className="p-6 border-b border-[#F3EBDD] flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-2xl text-[#39291F]">Sua Sacola</h3>
                <p className="text-[11px] text-[#77716B]">{cartItemsCount} item(ns) selecionado(s)</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full bg-[#F3EBDD] text-[#39291F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-10 h-10 text-[#70513D]/60 mx-auto mb-3 stroke-[1.5]" />
                  <p className="font-editorial text-2xl text-[#39291F]">Sua sacola está vazia</p>
                  <p className="text-xs text-[#77716B] mt-1">
                    Explore nossa vitrine para adicionar seus importados favoritos.
                  </p>
                </div>
              ) : (
                <>
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 p-3.5 rounded-3xl bg-[#F3EBDD]/45 border border-[#E5D5C0]/70"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF] overflow-hidden shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Sparkles className="w-5 h-5 text-[#70513D]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-[#39291F] truncate">{item.name}</h4>
                        <p className="text-xs font-semibold text-[#70513D] mt-0.5">
                          {formatCurrency(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-[#77716B] hover:text-[#39291F]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Cupom de Desconto */}
                  <div className="pt-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#77716B] mb-1.5">
                      Cupom Promocional
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Digite seu cupom"
                        className="flex-1 px-4 py-2.5 rounded-full bg-[#F3EBDD]/60 border border-[#E5D5C0] text-xs uppercase"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-5 py-2.5 rounded-full bg-[#70513D] text-[#FFFFFF] text-xs uppercase tracking-wider"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {/* Opção de Entrega */}
                  <div className="pt-2">
                    <label className="block text-[11px] uppercase tracking-wider text-[#77716B] mb-1.5">
                      Modalidade de Recebimento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('shipping')}
                        className={`py-2.5 px-3 rounded-2xl text-xs border transition-colors ${
                          deliveryMethod === 'shipping'
                            ? 'bg-[#39291F] text-[#FFFFFF] border-[#39291F]'
                            : 'bg-[#F3EBDD]/50 text-[#39291F] border-[#E5D5C0]'
                        }`}
                      >
                        Entrega no Endereço
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`py-2.5 px-3 rounded-2xl text-xs border transition-colors ${
                          deliveryMethod === 'pickup'
                            ? 'bg-[#39291F] text-[#FFFFFF] border-[#39291F]'
                            : 'bg-[#F3EBDD]/50 text-[#39291F] border-[#E5D5C0]'
                        }`}
                      >
                        Retirada Combinada
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-[#F3EBDD]/60 border-t border-[#E5D5C0] space-y-2.5 text-xs">
                <div className="flex justify-between text-[#77716B]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#70513D] font-medium">
                    <span>Desconto ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#77716B]">
                  <span>Frete</span>
                  <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-[#39291F] pt-2 border-t border-[#E5D5C0]">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCheckoutStep(1);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full mt-3 py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-widest font-medium hover:bg-[#70513D] transition-colors"
                >
                  Finalizar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE CHECKOUT SIMPLIFICADO & MERCADO PAGO                       */}
      {/* =================================================================== */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-[#39291F]/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-[2.25rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5D5C0] my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#F3EBDD]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#77716B]">
                  Checkout Seguro • Cybele Imports
                </span>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#39291F]">
                  {checkoutStep === 1
                    ? 'Dados para Entrega'
                    : checkoutStep === 2
                    ? 'Resumo & Pagamento'
                    : 'Pedido Registrado'}
                </h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 rounded-full bg-[#F3EBDD] text-[#39291F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkoutStep === 1 && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setCheckoutStep(2);
                }}
                className="mt-5 space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={checkoutForm.fullName}
                      onChange={(e) =>
                        setCheckoutForm((p) => ({ ...p, fullName: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">
                      WhatsApp / Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="(15) 99999-9999"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      value={checkoutForm.email}
                      onChange={(e) => setCheckoutForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">
                      CPF (Para emissão / Mercado Pago)
                    </label>
                    <input
                      type="text"
                      value={checkoutForm.cpf}
                      onChange={(e) => setCheckoutForm((p) => ({ ...p, cpf: e.target.value }))}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                    />
                  </div>
                </div>

                {deliveryMethod === 'shipping' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block font-medium text-[#39291F] mb-1">CEP *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.cep}
                          onChange={(e) => setCheckoutForm((p) => ({ ...p, cep: e.target.value }))}
                          placeholder="00000-000"
                          className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-medium text-[#39291F] mb-1">
                          Endereço Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.address}
                          onChange={(e) =>
                            setCheckoutForm((p) => ({ ...p, address: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-medium text-[#39291F] mb-1">Número *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.number}
                          onChange={(e) =>
                            setCheckoutForm((p) => ({ ...p, number: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-[#39291F] mb-1">Complemento</label>
                        <input
                          type="text"
                          value={checkoutForm.complement}
                          onChange={(e) =>
                            setCheckoutForm((p) => ({ ...p, complement: e.target.value }))
                          }
                          className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <label className="flex items-start gap-2.5 pt-2 text-[11px] text-[#77716B] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={checkoutForm.lgpdAccepted}
                    onChange={(e) =>
                      setCheckoutForm((p) => ({ ...p, lgpdAccepted: e.target.checked }))
                    }
                    className="mt-0.5 rounded accent-[#39291F]"
                  />
                  <span>
                    Concordo com o tratamento dos meus dados exclusivamente para entrega e
                    processamento deste pedido, em conformidade com a LGPD.
                  </span>
                </label>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] uppercase tracking-widest font-medium hover:bg-[#70513D]"
                  >
                    Continuar para Pagamento
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === 2 && (
              <form onSubmit={handleCreateOrder} className="mt-5 space-y-5 text-xs">
                <div className="bg-[#F3EBDD]/60 border border-[#E5D5C0] rounded-3xl p-5 space-y-2">
                  <p className="font-semibold text-[#39291F] uppercase tracking-wider text-[11px]">
                    Resumo do Pedido
                  </p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-[#77716B]">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#70513D]">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#77716B]">
                    <span>Frete</span>
                    <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-[#39291F] pt-2 border-t border-[#E5D5C0]">
                    <span>Total a Pagar</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Escolha de Pagamento (Intermediação Direta Sem Taxas) */}
                <div>
                  <p className="font-medium text-[#39291F] mb-2.5">
                    Escolha a Forma de Pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutForm((p) => ({ ...p, paymentMethod: 'pix' }))}
                      className={`p-4 rounded-3xl border text-left flex items-center gap-3 transition-all ${
                        checkoutForm.paymentMethod === 'pix'
                          ? 'bg-[#39291F] text-[#FFFFFF] border-[#39291F]'
                          : 'bg-[#FFFFFF] text-[#39291F] border-[#E5D5C0]'
                      }`}
                    >
                      <QrCode className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-semibold">PIX Direto</p>
                        <p className="text-[10px] opacity-80">QR Code e Copia e Cola</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCheckoutForm((p) => ({ ...p, paymentMethod: 'credit_card' }))
                      }
                      className={`p-4 rounded-3xl border text-left flex items-center gap-3 transition-all ${
                        checkoutForm.paymentMethod === 'credit_card'
                          ? 'bg-[#39291F] text-[#FFFFFF] border-[#39291F]'
                          : 'bg-[#FFFFFF] text-[#39291F] border-[#E5D5C0]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 shrink-0" />
                      <div>
                        <p className="font-semibold">Cartão de Crédito</p>
                        <p className="text-[10px] opacity-80">Link seguro de pagamento</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F3EBDD]/40 border border-[#E5D5C0] text-[11px] text-[#77716B] flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#70513D] shrink-0" />
                  <span>
                    Pagamento protegido: o código PIX é gerado automaticamente no valor exato do
                    seu pedido, sem exibir dados internos ou taxas extras.
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="px-5 py-3 rounded-full bg-[#F3EBDD] text-[#39291F] uppercase tracking-wider"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] uppercase tracking-widest font-medium hover:bg-[#70513D]"
                  >
                    {checkoutForm.paymentMethod === 'pix'
                      ? 'Gerar QR Code PIX'
                      : 'Finalizar Pedido'}
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === 3 && completedOrder && (
              <div className="mt-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#F3EBDD] text-[#39291F] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-[#70513D]" />
                </div>
                <h4 className="font-editorial text-3xl text-[#39291F]">
                  Pedido {completedOrder.orderNumber} Criado!
                </h4>

                {completedOrder.paymentMethod === 'pix' && completedOrder.pixCopyPaste ? (
                  <div className="bg-[#F3EBDD]/65 border border-[#E5D5C0] rounded-3xl p-5 max-w-md mx-auto space-y-3">
                    <p className="text-xs font-medium text-[#39291F]">
                      Escaneie o QR Code ou copie o código PIX abaixo no aplicativo do seu banco:
                    </p>
                    <div className="w-44 h-44 mx-auto bg-[#FFFFFF] p-2.5 rounded-2xl border border-[#E5D5C0] flex items-center justify-center">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                          completedOrder.pixCopyPaste
                        )}`}
                        alt="QR Code PIX Cybele Imports"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-sm font-semibold text-[#39291F]">
                      Valor: {formatCurrency(completedOrder.total)}
                    </p>
                    <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5D5C0] rounded-2xl p-2">
                      <input
                        type="text"
                        readOnly
                        value={completedOrder.pixCopyPaste}
                        className="flex-1 bg-transparent text-[11px] text-[#77716B] px-2 focus:outline-none truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(completedOrder.pixCopyPaste);
                          showToast('Código PIX Copia e Cola copiado!');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#39291F] text-[#FFFFFF] text-[11px] font-medium uppercase tracking-wider shrink-0 hover:bg-[#70513D]"
                      >
                        Copiar PIX
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#77716B] max-w-md mx-auto leading-relaxed">
                    Seu pedido foi registrado. Clique abaixo para receber o link seguro de
                    pagamento no cartão pelo nosso atendimento oficial.
                  </p>
                )}

                <div className="bg-[#F3EBDD]/40 border border-[#E5D5C0] rounded-3xl p-4 text-left text-xs max-w-md mx-auto space-y-1">
                  <p>
                    <strong>Cliente:</strong> {completedOrder.customer.fullName}
                  </p>
                  <p>
                    <strong>Forma de Pagamento:</strong>{' '}
                    {completedOrder.paymentMethod === 'pix'
                      ? 'PIX Instantâneo'
                      : 'Cartão de Crédito'}
                  </p>
                  <p>
                    <strong>Total:</strong> {formatCurrency(completedOrder.total)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <a
                    href={`${STORE_CONFIG.whatsappLink}&text=${encodeURIComponent(
                      `Olá! Realizei o pedido ${completedOrder.orderNumber} (${formatCurrency(
                        completedOrder.total
                      )}) na Cybele Imports e segue o comprovante.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-full bg-[#39291F] text-[#FFFFFF] text-xs uppercase tracking-wider inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Enviar Comprovante no WhatsApp
                  </a>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-6 py-3 rounded-full bg-[#F3EBDD] text-[#39291F] text-xs uppercase tracking-wider"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE AUTENTICAÇÃO (DIFERENCIAÇÃO CLIENTE VS PROPRIETÁRIA)       */}
      {/* =================================================================== */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#39291F]/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-[2.25rem] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5D5C0] relative">
            <button
              onClick={() => setIsAccountModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-[#F3EBDD] text-[#39291F]"
            >
              <X className="w-4 h-4" />
            </button>

            {authModalMode === 'admin' ? (
              <>
                <div className="mb-5 p-3 rounded-2xl bg-[#39291F] text-[#F3EBDD] flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-wider font-medium text-[#E5D5C0]">
                    Perfil: Proprietária da Loja
                  </span>
                  <span className="text-[10px] text-[#F3EBDD]/75">Acesso Restrito</span>
                </div>
                <h3 className="font-editorial text-3xl text-[#39291F] mb-2">
                  Gestão Cybele Imports
                </h3>
                <p className="text-xs text-[#77716B] mb-6 leading-relaxed">
                  Área exclusiva para administração de catálogo, fotografias, estoque e pedidos.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#39291F] text-[#FFFFFF] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E5D5C0] shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">
                      E-mail Administrativo
                    </label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Digite o e-mail da proprietária"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={authForm.password}
                        onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="••••••••••••"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#77716B]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] uppercase tracking-widest font-medium hover:bg-[#70513D] transition-colors"
                  >
                    Entrar no Painel
                  </button>
                </form>

                <div className="mt-5 pt-4 border-t border-[#F3EBDD] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('login');
                      setAuthError('');
                    }}
                    className="text-xs text-[#70513D] hover:underline"
                  >
                    Voltar para o Acesso de Cliente
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-4 p-2.5 rounded-2xl bg-[#F3EBDD]/80 border border-[#70513D]/15 flex items-center justify-between text-[11px]">
                  <span className="uppercase tracking-wider font-medium text-[#39291F]">
                    Perfil: Cliente
                  </span>
                  <span className="text-[10px] text-[#77716B]">Compras e Pedidos</span>
                </div>
                <h3 className="font-editorial text-3xl text-[#39291F] mb-1.5">
                  {authModalMode === 'register' ? 'Criar sua Conta' : 'Bem-vindo(a)'}
                </h3>
                <p className="text-xs text-[#77716B] mb-5">
                  Acesse com sua conta Google ou utilize seu e-mail e senha para acompanhar seus
                  pedidos.
                </p>

                {/* Botão Entrar com Google */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-full bg-[#FFFFFF] border border-[#E5D5C0] hover:bg-[#F3EBDD]/60 transition-colors flex items-center justify-center gap-3 text-xs font-medium text-[#39291F] mb-4 shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.05 21.2 7.24 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.03 14.04c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.18H1.02C.37 7.47 0 8.91 0 10.44s.37 2.97 1.02 4.26l4.01-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.02 6.82l4.01 3.14c.98-2.94 3.73-5.21 6.97-5.21Z"
                    />
                  </svg>
                  <span>Continuar com Google</span>
                </button>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-[#E5D5C0] w-full" />
                  <span className="bg-[#FFFFFF] px-3 text-[10px] uppercase tracking-widest text-[#77716B]">
                    ou com e-mail
                  </span>
                  <div className="border-t border-[#E5D5C0] w-full" />
                </div>

                {authError && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#39291F] text-[#FFFFFF] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#E5D5C0] shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleCustomerEmailAuth} className="space-y-3.5 text-xs">
                  {authModalMode === 'register' && (
                    <div>
                      <label className="block font-medium text-[#39291F] mb-1">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={authForm.name}
                        onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Seu nome"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">E-mail</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="voce@exemplo.com"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0]"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-[#39291F] mb-1">Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={authForm.password}
                        onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Mínimo 8 caracteres, 1 maiúscula e 1 número"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0] pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#77716B]"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {authModalMode === 'register' && (
                    <div>
                      <label className="block font-medium text-[#39291F] mb-1">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        required
                        value={authForm.confirmPassword}
                        onChange={(e) =>
                          setAuthForm((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                        placeholder="Repita sua senha"
                        className="w-full px-4 py-3 rounded-2xl bg-[#F3EBDD]/50 border border-[#E5D5C0]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-full bg-[#39291F] text-[#FFFFFF] uppercase tracking-widest font-medium hover:bg-[#70513D] transition-colors"
                  >
                    {authModalMode === 'register' ? 'Criar Conta Segura' : 'Entrar'}
                  </button>
                </form>

                <div className="mt-4 flex flex-col items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode(authModalMode === 'register' ? 'login' : 'register');
                      setAuthError('');
                    }}
                    className="text-[#70513D] font-medium hover:underline"
                  >
                    {authModalMode === 'register'
                      ? 'Já possui conta? Entrar'
                      : 'Não tem conta? Cadastre-se aqui'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('admin');
                      setAuthError('');
                    }}
                    className="text-[11px] text-[#77716B] hover:text-[#39291F] mt-1"
                  >
                    Acesso exclusivo da Proprietária
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}