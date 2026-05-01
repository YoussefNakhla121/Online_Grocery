import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    useMemo,
} from "react";
import {
    ShoppingCart,
    User,
    Search,
    Hexagon,
    Box,
    ChevronRight,
    Check,
    Mail,
    Lock,
    Phone,
    LayoutDashboard,
    Package,
    Plus,
    Pencil,
    Trash2,
    LogOut,
    Upload,
    ArrowLeft,
    Star,
    Heart,
    Minus,
    MapPin,
    CreditCard,
    Banknote,
    Menu,
    Apple,
    Carrot,
    Milk,
    Croissant,
    Coffee,
    Fish,
    IceCream,
    Wheat,
    Egg,
    Wine,
} from "lucide-react";

// --- THEME CONSTANTS ---
const COLORS = {
    primary: "#9b2c2c", // Brand Red
    secondary: "#739e54", // Action Green
    bgLight: "#ffffe6", // Pale Yellow Background
    textDark: "#2d3748",
    textLight: "#718096",
};

const FALLBACK_IMAGES_BY_CATEGORY = {
    Fruits: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?auto=format&fit=crop&w=800&q=80",
    Vegetables:
        "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80",
    Dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80",
    Bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
    Seafood: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=800&q=80",
    default:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
};

function getProductImageSrc(product) {
    if (!product) return FALLBACK_IMAGES_BY_CATEGORY.default;
    if (product.image) return product.image;
    const cat = product.category || "default";
    return FALLBACK_IMAGES_BY_CATEGORY[cat] || FALLBACK_IMAGES_BY_CATEGORY.default;
}

const ProductImage = ({ product, className = "", alt }) => {
    const [src, setSrc] = useState(getProductImageSrc(product));
    useEffect(() => setSrc(getProductImageSrc(product)), [product?.image, product?.category]);
    return (
        <img
            src={src}
            alt={alt || product?.name || "Product"}
            className={className}
            onError={() => setSrc(FALLBACK_IMAGES_BY_CATEGORY.default)}
        />
    );
};

// --- MOCK DATABASE (Fallback if API is down) ---
let mockProducts = [
    {
        id: 1,
        name: "Fresh Organic Apples",
        price: 4.99,
        category: "Fruits",
        stock: 150,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?auto=format&fit=crop&w=400&q=80",
        description:
            "Crisp and sweet organic apples, freshly picked from local farms. Rich in vitamins and perfect for snacking, baking, or adding to salads.",
    },
    {
        id: 2,
        name: "Green Vegetables Mix",
        price: 3.49,
        category: "Vegetables",
        stock: 85,
        image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80",
        description: "A healthy mix of fresh green vegetables.",
    },
    {
        id: 3,
        name: "Fresh Citrus Fruits",
        price: 6.99,
        category: "Fruits",
        stock: 120,
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80",
        description:
            "Assorted fresh citrus fruits including oranges and lemons.",
    },
    {
        id: 4,
        name: "Dairy Milk",
        price: 2.99,
        category: "Dairy",
        stock: 200,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
        description: "Fresh whole dairy milk, 1 Gallon.",
    },
    {
        id: 5,
        name: "Whole Wheat Bread",
        price: 3.99,
        category: "Bakery",
        stock: 60,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
        description: "Freshly baked whole wheat bread.",
    },
    {
        id: 6,
        name: "Organic Eggs",
        price: 5.49,
        category: "Dairy",
        stock: 95,
        image: "https://images.unsplash.com/photo-1587486913049-53fc88980fdc?auto=format&fit=crop&w=400&q=80",
        description: "Farm fresh organic eggs, dozen.",
    },
    {
        id: 7,
        name: "Premium Salmon",
        price: 12.99,
        category: "Seafood",
        stock: 40,
        image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=400&q=80",
        description: "Wild caught premium salmon fillet.",
    },
    {
        id: 8,
        name: "Mixed Berry Selection",
        price: 9.99,
        category: "Fruits",
        stock: 75,
        image: "https://images.unsplash.com/photo-1513612254505-fb553147a2e8?auto=format&fit=crop&w=400&q=80",
        description:
            "A fresh selection of strawberries, blueberries, and raspberries.",
    },
];
let mockCart = [];
let mockUsers = [
    {
        id: 1,
        email: "test@example.com",
        password: "password",
        name: "John Doe",
        role: "admin",
    },
];

// --- API WRAPPER ---
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = {
    async safeFetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });
            if (!response.ok) {
                let details = "";
                try {
                    details = await response.text();
                } catch {
                    // ignore
                }
                throw new Error(details || `API error (${response.status})`);
            }

            // 204 No Content (e.g., DELETE)
            if (response.status === 204) return null;

            const text = await response.text();
            return text ? JSON.parse(text) : null;
        } catch (error) {
            console.warn(`API ${endpoint} failed (${error?.message || "unknown"}), using mock data.`);
            return null; // Signals to use fallback
        }
    },
    async login(email, password) {
        const res = await this.safeFetch("/users/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        if (res) return res; // backend returns {id, email, password}
        // Fallback
        const user = mockUsers.find(
            (u) => u.email === email && u.password === password,
        );
        if (!user) throw new Error("Invalid credentials");
        return user; // return user directly, not wrapped
    },
    async register(data) {
        const res = await this.safeFetch("/users/register", {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (res) return res; // backend returns {id, email, password}
        // Fallback
        const newUser = { id: Date.now(), ...data, role: "user" };
        mockUsers.push(newUser);
        return newUser; // return user directly
    },
    async getProducts() {
        const res = await this.safeFetch("/products");
        return res || [...mockProducts];
    },
    async getProduct(id) {
        const res = await this.safeFetch(`/products/${id}`);
        return res || mockProducts.find((p) => p.id === parseInt(id));
    },
    async createProduct(data) {
        const res = await this.safeFetch("/products", {
            method: "POST",
            body: JSON.stringify(data),
        });
        if (res) return res;
        // Fallback
        const newProduct = {
            id: Date.now(),
            ...data,
            image:
                data.image ||
                "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
        };
        mockProducts.push(newProduct);
        return newProduct;
    },
    async updateProduct(id, data) {
        // Assuming PUT endpoint exists
        const res = await this.safeFetch(`/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        if (res) return res;
        // Fallback
        const idx = mockProducts.findIndex((p) => p.id === parseInt(id));
        if (idx !== -1) mockProducts[idx] = { ...mockProducts[idx], ...data };
        return mockProducts[idx];
    },
    async deleteProduct(id) {
        // Assuming DELETE endpoint exists
        const res = await this.safeFetch(`/products/${id}`, {
            method: "DELETE",
        });
        if (res) return true;
        // Fallback
        mockProducts = mockProducts.filter((p) => p.id !== parseInt(id));
        return true;
    },
    async getCart(userId) {
        const res = await this.safeFetch(`/carts/${userId}/items`);
        return res || mockCart;
    },
    async addToCart(userId, productId, quantity = 1) {
        const res = await this.safeFetch(`/carts/${userId}/items`, {
            method: "POST",
            body: JSON.stringify({ productid: productId, quantity }),
        });
        if (res) return res;
        // Fallback
        const existing = mockCart.find((item) => item.productid === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            const product = mockProducts.find((p) => p.id === productId);
            if (product) mockCart.push({ id: Date.now(), product, quantity });
        }
        return mockCart;
    },
    async clearCart(userId) {
        const res = await this.safeFetch(`/carts/${userId}/items`, {
            method: "DELETE",
        });
        return res;
    },
};

// --- CONTEXTS ---
const AuthContext = createContext();
const CartContext = createContext();
const RouterContext = createContext();

// --- COMPONENTS ---

const Button = ({
    children,
    variant = "primary",
    className = "",
    ...props
}) => {
    const baseStyle =
        "inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-medium transition-colors duration-200";
    const variants = {
        primary: `bg-[${COLORS.primary}] text-white hover:bg-red-900`,
        secondary: `bg-[${COLORS.secondary}] text-white hover:bg-green-700`,
        outline: `border-2 border-[${COLORS.primary}] text-[${COLORS.primary}] hover:bg-red-50`,
        ghost: "text-gray-600 hover:bg-gray-100",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };
    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${className}`}
            {...props}>
            {children}
        </button>
    );
};

const Input = ({ icon: Icon, className = "", ...props }) => (
    <div className={`relative ${className}`}>
        {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
            className={`w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent ${Icon ? "pl-10" : ""}`}
            {...props}
        />
    </div>
);

const Logo = () => (
    <div className="flex items-center gap-2 cursor-pointer">
        <div
            className={`relative flex items-center justify-center w-10 h-10 bg-[${COLORS.primary}] rounded-lg`}>
            <Hexagon
                className="text-white w-8 h-8 absolute"
                strokeWidth={1.5}
                fill={COLORS.primary}
            />
            <Box className="text-white w-5 h-5 relative z-10" />
        </div>
        <span className={`text-xl font-bold text-[${COLORS.primary}]`}>
            FreshMart
        </span>
    </div>
);

// --- MAIN LAYOUTS ---

const Header = () => {
    const { navigate } = useContext(RouterContext);
    const { user } = useContext(AuthContext);
    const { cart } = useContext(CartContext);

    const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="bg-white py-4 px-6 md:px-12 flex items-center justify-between shadow-sm sticky top-0 z-50">
            <div onClick={() => navigate("home")}>
                <Logo />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
                <button
                    onClick={() => navigate("home")}
                    className="hover:text-[#9b2c2c]">
                    Home
                </button>
                <button
                    onClick={() => navigate("categories")}
                    className="hover:text-[#9b2c2c]">
                    Categories
                </button>
                <button className="hover:text-[#9b2c2c]">Contact</button>
            </nav>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("cart")}
                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                    <ShoppingCart className="w-6 h-6" />
                    {cartItemCount > 0 && (
                        <span className="absolute top-0 right-0 bg-[#9b2c2c] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                            {cartItemCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => navigate(user ? "profile" : "login")}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition">
                    <User className="w-6 h-6" />
                </button>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
                <Logo />
                <p className="mt-4 text-sm text-gray-500">
                    Your trusted source for fresh groceries delivered to your
                    doorstep.
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                    Quick Links
                </h4>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            About Us
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Contact
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Careers
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">Blog</button>
                    </li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-4">
                    Customer Service
                </h4>
                <ul className="space-y-2 text-sm text-gray-500">
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Help Center
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Track Order
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Returns
                        </button>
                    </li>
                    <li>
                        <button className="hover:text-[#9b2c2c]">
                            Shipping Info
                        </button>
                    </li>
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-gray-800 mb-4">Contact Us</h4>
                <ul className="space-y-3 text-sm text-gray-500">
                    <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4" /> +1 (555) 123-4567
                    </li>
                    <li className="flex items-center gap-2">
                        <Mail className="w-4 h-4" /> hello@freshmart.com
                    </li>
                    <li className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> 123 Main St, City
                    </li>
                </ul>
            </div>
        </div>
        <div className="text-center text-xs text-gray-400">
            &copy; 2026 FreshMart. All rights reserved.
        </div>
    </footer>
);

// --- SCREENS ---

const Home = () => {
    const { navigate } = useContext(RouterContext);
    const { addToCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [addedItems, setAddedItems] = useState({});
    const [query, setQuery] = useState("");

    useEffect(() => {
        api.getProducts().then((data) => setProducts(data.slice(0, 8))); // Feature 8 items
    }, []);

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        setAddedItems((prev) => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
            setAddedItems((prev) => ({ ...prev, [product.id]: false }));
        }, 2000);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
                <Input
                    icon={Search}
                    placeholder="Search groceries..."
                    className="shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Hero Banner */}
            <div
                className={`bg-[${COLORS.primary}] rounded-2xl p-10 md:p-16 text-white mb-12 shadow-lg relative overflow-hidden`}>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-4xl font-bold mb-4">
                        Weekend Special!
                    </h1>
                    <p className="text-red-100 text-lg mb-8">
                        Get up to 30% off on fresh fruits & vegetables
                    </p>
                    <Button
                        variant="secondary"
                        className="bg-white !text-[#9b2c2c] hover:bg-gray-100"
                        onClick={() => navigate("categories")}>
                        Shop Now
                    </Button>
                </div>
                {/* Decorative circle */}
                <div className="absolute -right-20 -bottom-40 w-96 h-96 bg-red-800 rounded-full opacity-50 blur-3xl"></div>
            </div>

            {/* Featured Products */}
            <div className="flex justify-between items-end mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    Featured Products
                </h2>
                <button
                    onClick={() => navigate("categories")}
                    className="text-sm font-medium text-[#9b2c2c] hover:underline">
                    View All
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
                {products
                    .filter((p) => {
                        const q = query.trim().toLowerCase();
                        if (!q) return true;
                        return (
                            (p.name || "").toLowerCase().includes(q) ||
                            (p.category || "").toLowerCase().includes(q)
                        );
                    })
                    .map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                        <div
                            className="relative h-48 rounded-lg mb-4 overflow-hidden cursor-pointer"
                            onClick={() =>
                                navigate("product", { id: product.id })
                            }>
                            <ProductImage
                                product={product}
                                alt={product.name}
                                className="w-full h-full object-cover hover:scale-105 transition duration-300"
                            />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                            {product.name}
                        </h3>
                        <p className="text-[#9b2c2c] font-bold mb-4">
                            ${product.price.toFixed(2)}
                            <span className="text-xs text-gray-400 font-normal">
                                /per item
                            </span>
                        </p>

                        <div className="mt-auto">
                            {addedItems[product.id] ? (
                                <Button className="w-full !bg-[#739e54] gap-2 cursor-default">
                                    <Check className="w-4 h-4" /> Added to Cart
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    className="w-full gap-2 bg-[#739e54]"
                                    onClick={() => handleAddToCart(product)}>
                                    <Plus className="w-4 h-4" /> Add to Cart
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center border-t border-gray-200 pt-12">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-[#739e54] mb-4">
                        <Package className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">
                        Fresh Products
                    </h3>
                    <p className="text-sm text-gray-500">
                        Sourced daily from local farms
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-[#739e54] mb-4">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">
                        Fast Delivery
                    </h3>
                    <p className="text-sm text-gray-500">
                        Free delivery on orders over $50
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-[#739e54] mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">
                        24/7 Support
                    </h3>
                    <p className="text-sm text-gray-500">
                        We're here to help anytime
                    </p>
                </div>
            </div>
        </div>
    );
};

const Categories = () => {
    const { navigate } = useContext(RouterContext);
    const [query, setQuery] = useState("");
    const categories = [
        {
            name: "Fruits",
            icon: Apple,
            color: "bg-red-50",
            text: "text-red-600",
        },
        {
            name: "Vegetables",
            icon: Carrot,
            color: "bg-orange-50",
            text: "text-orange-600",
        },
        {
            name: "Dairy",
            icon: Milk,
            color: "bg-blue-50",
            text: "text-blue-600",
        },
        {
            name: "Meat & Poultry",
            icon: Box,
            color: "bg-rose-50",
            text: "text-rose-600",
        },
        {
            name: "Bakery",
            icon: Croissant,
            color: "bg-amber-50",
            text: "text-amber-600",
        },
        {
            name: "Beverages",
            icon: Coffee,
            color: "bg-purple-50",
            text: "text-purple-600",
        },
        {
            name: "Seafood",
            icon: Fish,
            color: "bg-cyan-50",
            text: "text-cyan-600",
        },
        {
            name: "Frozen Foods",
            icon: IceCream,
            color: "bg-sky-50",
            text: "text-sky-600",
        },
        {
            name: "Grains & Pasta",
            icon: Wheat,
            color: "bg-yellow-50",
            text: "text-yellow-600",
        },
        {
            name: "Salads",
            icon: Apple,
            color: "bg-green-50",
            text: "text-green-600",
        },
        {
            name: "Eggs",
            icon: Egg,
            color: "bg-stone-50",
            text: "text-stone-600",
        },
        {
            name: "Wine & Spirits",
            icon: Wine,
            color: "bg-pink-50",
            text: "text-pink-600",
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Browse Categories
            </h2>
            <div className="max-w-2xl mb-8">
                <Input
                    icon={Search}
                    placeholder="Search groceries..."
                    className="shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {categories
                    .filter((c) => {
                        const q = query.trim().toLowerCase();
                        if (!q) return true;
                        return c.name.toLowerCase().includes(q);
                    })
                    .map((cat, i) => (
                    <div
                        key={i}
                        onClick={() =>
                            navigate("category", { category: cat.name })
                        }
                        className={`${cat.color} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition h-32`}>
                        <cat.icon className={`w-8 h-8 ${cat.text} mb-3`} />
                        <span className="font-medium text-gray-700 text-sm">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CategoryProducts = ({ params }) => {
    const { navigate } = useContext(RouterContext);
    const { addToCart } = useContext(CartContext);
    const category = params?.category || "";
    const [products, setProducts] = useState([]);
    const [query, setQuery] = useState("");

    useEffect(() => {
        api.getProducts().then((data) => setProducts(data));
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter((p) => {
            if (category && (p.category || "") !== category) return false;
            if (!q) return true;
            return (
                (p.name || "").toLowerCase().includes(q) ||
                (p.description || "").toLowerCase().includes(q)
            );
        });
    }, [products, query, category]);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="outline" onClick={() => navigate("categories")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Categories
                </Button>
                <h2 className="text-2xl font-bold text-gray-800">
                    {category || "Products"}
                </h2>
            </div>

            <div className="max-w-2xl mb-8">
                <Input
                    icon={Search}
                    placeholder={`Search in ${category || "products"}...`}
                    className="shadow-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                    No products found.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map((product) => (
                        <div
                            key={product.id}
                            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                            <div
                                className="relative h-48 rounded-lg mb-4 overflow-hidden cursor-pointer"
                                onClick={() =>
                                    navigate("product", { id: product.id })
                                }>
                                <ProductImage
                                    product={product}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition duration-300"
                                />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                                {product.name}
                            </h3>
                            <p className="text-[#9b2c2c] font-bold mb-4">
                                ${Number(product.price).toFixed(2)}
                            </p>
                            <Button
                                variant="secondary"
                                className="mt-auto w-full gap-2 bg-[#739e54]"
                                onClick={() => addToCart(product, 1)}>
                                <Plus className="w-4 h-4" /> Add to Cart
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductDetails = ({ params }) => {
    const { navigate } = useContext(RouterContext);
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (params?.id) {
            api.getProduct(params.id).then(setProduct);
        }
    }, [params]);

    if (!product) return <div className="p-12 text-center">Loading...</div>;

    const handleAdd = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-1/2 relative rounded-2xl overflow-hidden bg-gray-50 h-96">
                    <ProductImage
                        product={product}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <button className="absolute top-4 right-4 bg-white p-2 rounded-full shadow hover:text-red-500 transition">
                        <Heart className="w-5 h-5" />
                    </button>
                </div>

                <div className="w-full md:w-1/2 flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 fill-current" />
                            <Star className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="text-sm text-gray-500">
                            4.5 (128 reviews)
                        </span>
                    </div>

                    <div className="text-3xl font-bold text-[#9b2c2c] mb-6">
                        ${product.price.toFixed(2)}
                        <span className="text-base text-gray-500 font-normal">
                            {" "}
                            /per kg
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-[#739e54] font-medium mb-6">
                        <div className="w-2 h-2 rounded-full bg-[#739e54]"></div>
                        In Stock
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">
                            Description
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100 flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-700">
                                Quantity
                            </span>
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="p-2 hover:bg-gray-200 rounded-l-lg">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-10 text-center font-medium">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="p-2 hover:bg-gray-200 rounded-r-lg">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {added ? (
                            <Button className="flex-1 !bg-[#739e54] gap-2 h-12 text-lg">
                                <Check className="w-5 h-5" /> Added to Cart
                            </Button>
                        ) : (
                            <Button
                                className="flex-1 bg-[#739e54] gap-2 h-12 text-lg"
                                variant="secondary"
                                onClick={handleAdd}>
                                <ShoppingCart className="w-5 h-5" /> Add to Cart
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
    const { navigate } = useContext(RouterContext);
    const { cart, updateQuantity, removeFromCart } = useContext(CartContext);

    const subtotal = cart.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
    );
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                <ShoppingCart className="w-20 h-20 mx-auto text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Your cart is empty
                </h2>
                <Button onClick={() => navigate("home")}>
                    Continue Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
                Shopping Cart
            </h2>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                            <ProductImage
                                product={item.product}
                                alt={item.product.name}
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 text-sm">
                                    {item.product.name}
                                </h3>
                                <p className="text-xs text-gray-500 mb-1">
                                    per kg
                                </p>
                                <p className="text-[#9b2c2c] font-bold">
                                    ${item.product.price.toFixed(2)}
                                </p>
                            </div>
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            Math.max(1, item.quantity - 1),
                                        )
                                    }
                                    className="p-1.5 hover:bg-gray-200 rounded-l-lg">
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-medium">
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                        )
                                    }
                                    className="p-1.5 hover:bg-gray-200 rounded-r-lg">
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-2">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-[400px]">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Order Summary
                        </h3>
                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span
                                    className={
                                        shipping === 0
                                            ? "text-[#739e54] font-medium"
                                            : ""
                                    }>
                                    {shipping === 0
                                        ? "FREE"
                                        : `$${shipping.toFixed(2)}`}
                                </span>
                            </div>
                            {shipping > 0 && (
                                <div className="text-xs text-gray-400">
                                    Add ${(50 - subtotal).toFixed(2)} more for
                                    free shipping!
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800 text-lg">
                                Total
                            </span>
                            <span className="font-bold text-[#9b2c2c] text-2xl">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <Button
                            className="w-full bg-[#739e54] mb-3 py-3 text-lg"
                            variant="secondary"
                            onClick={() => navigate("checkout")}>
                            Proceed to Checkout{" "}
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate("home")}>
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => {
    const { navigate } = useContext(RouterContext);
    const { cart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const [method, setMethod] = useState("card");

    const subtotal = cart.reduce(
        (acc, item) => acc + item.product.price * item.quantity,
        0,
    );
    const total = subtotal + subtotal * 0.1 + (subtotal > 50 ? 0 : 5.99);

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h2>
            <p className="text-gray-500 mb-8">Complete your order</p>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    {/* Address Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-[#9b2c2c] text-white flex items-center justify-center font-bold text-sm">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Delivery Address
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <Input placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <Input placeholder="+1 (555) 123-4567" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <Input placeholder="123 Main Street" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City
                                </label>
                                <Input placeholder="New York" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State
                                </label>
                                <Input placeholder="NY" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ZIP Code
                                </label>
                                <Input placeholder="10001" />
                            </div>
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-full bg-[#9b2c2c] text-white flex items-center justify-center font-bold text-sm">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">
                                Payment Method
                            </h3>
                        </div>

                        <div className="space-y-4 mb-6">
                            <label
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${method === "card" ? "border-[#9b2c2c] bg-red-50" : "border-gray-200"}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    className="w-4 h-4 text-[#9b2c2c] focus:ring-[#9b2c2c]"
                                    checked={method === "card"}
                                    onChange={() => setMethod("card")}
                                />
                                <CreditCard
                                    className={`w-6 h-6 ml-4 mr-3 ${method === "card" ? "text-[#9b2c2c]" : "text-gray-400"}`}
                                />
                                <div>
                                    <div className="font-medium text-gray-800">
                                        Credit/Debit Card
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Pay securely with your card
                                    </div>
                                </div>
                                {method === "card" && (
                                    <Check className="w-5 h-5 ml-auto text-[#9b2c2c]" />
                                )}
                            </label>

                            <label
                                className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${method === "cash" ? "border-[#9b2c2c] bg-red-50" : "border-gray-200"}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    className="w-4 h-4 text-[#9b2c2c] focus:ring-[#9b2c2c]"
                                    checked={method === "cash"}
                                    onChange={() => setMethod("cash")}
                                />
                                <Banknote
                                    className={`w-6 h-6 ml-4 mr-3 ${method === "cash" ? "text-[#9b2c2c]" : "text-gray-400"}`}
                                />
                                <div>
                                    <div className="font-medium text-gray-800">
                                        Cash on Delivery
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Pay when you receive
                                    </div>
                                </div>
                                {method === "cash" && (
                                    <Check className="w-5 h-5 ml-auto text-[#9b2c2c]" />
                                )}
                            </label>
                        </div>

                        {method === "card" && (
                            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Number
                                    </label>
                                    <Input placeholder="1234 5678 9012 3456" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Expiry Date
                                    </label>
                                    <Input placeholder="MM/YY" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV
                                    </label>
                                    <Input placeholder="123" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="w-full lg:w-[400px]">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">
                            Order Summary
                        </h3>
                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate pr-4">
                                        {item.product.name} × {item.quantity}
                                    </span>
                                    <span className="text-gray-800 font-medium">
                                        $
                                        {(
                                            item.product.price * item.quantity
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-4 space-y-3 text-sm text-gray-600 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%)</span>
                                <span>${(subtotal * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span
                                    className={
                                        subtotal > 50
                                            ? "text-[#739e54] font-medium"
                                            : ""
                                    }>
                                    {subtotal > 50 ? "FREE" : "$5.99"}
                                </span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center mb-6">
                            <span className="font-bold text-gray-800 text-lg">
                                Total
                            </span>
                            <span className="font-bold text-[#9b2c2c] text-2xl">
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <Button
                            className="w-full bg-[#739e54] py-3 text-lg"
                            variant="secondary"
                            onClick={async () => {
                                if (user) await api.clearCart(user.id);
                                clearCart();
                                alert("Order Placed Successfully!");
                                navigate("home");
                            }}>
                            Confirm Order
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                            <Lock className="w-3 h-3" /> Your payment
                            information is secure and encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { navigate } = useContext(RouterContext);

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8 flex items-center gap-6">
                <div className="w-20 h-20 bg-[#9b2c2c] rounded-full text-white text-2xl font-bold flex items-center justify-center">
                    {user.name
                        ? user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                        : "JD"}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {user.name || "John Doe"}
                    </h2>
                    <p className="text-gray-500">{user.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <Package className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-500 mb-1">
                        Total Orders
                    </span>
                    <span className="text-2xl font-bold text-gray-800">12</span>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <Star className="w-8 h-8 text-[#739e54] mb-2" />
                    <span className="text-sm text-gray-500 mb-1">
                        Loyalty Points
                    </span>
                    <span className="text-2xl font-bold text-gray-800">
                        250
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Actions
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        {[
                            "Order History",
                            "Track Order",
                            "Saved Addresses",
                            "Payment Methods",
                        ].map((item, i) => (
                            <button
                                key={i}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                                <div className="flex items-center gap-3">
                                    {i === 0 && (
                                        <Package className="w-5 h-5 text-blue-500" />
                                    )}
                                    {i === 1 && (
                                        <MapPin className="w-5 h-5 text-[#739e54]" />
                                    )}
                                    {i === 2 && (
                                        <MapPin className="w-5 h-5 text-purple-500" />
                                    )}
                                    {i === 3 && (
                                        <CreditCard className="w-5 h-5 text-orange-500" />
                                    )}
                                    {item}
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Settings
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-gray-400" />
                                Edit Profile
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-sm font-medium text-gray-700">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 text-gray-400" />
                                Change Password
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                        {user?.role === "admin" && (
                            <button
                                onClick={() => navigate("admin")}
                                className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition text-sm font-medium text-[#9b2c2c]">
                                <div className="flex items-center gap-3">
                                    <LayoutDashboard className="w-5 h-5 text-[#9b2c2c]" />
                                    Admin Panel
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#9b2c2c]" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Button
                    variant="outline"
                    className="w-64 text-red-500 border-red-200 hover:bg-red-50 gap-2"
                    onClick={() => {
                        logout();
                        navigate("home");
                    }}>
                    <LogOut className="w-4 h-4" /> Logout
                </Button>
            </div>
        </div>
    );
};

const AuthScreen = ({ isLogin }) => {
    const { navigate } = useContext(RouterContext);
    const { login, register } = useContext(AuthContext);
    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("12345678");
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register({ name, email, password });
            }
            navigate("home");
        } catch (err) {
            setError(err.message || "Authentication failed");
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-200px)]">
            {/* Left side text */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-[#9b2c2c] mb-6 leading-tight">
                    Fresh Groceries
                    <br />
                    Delivered to Your
                    <br />
                    Door
                </h1>
                <p className="text-gray-600 text-lg mb-12 max-w-md">
                    Quality products, unbeatable prices, and fast delivery. Shop
                    the freshest groceries from local farms and trusted brands.
                </p>
                <div className="flex gap-8 text-[#9b2c2c]">
                    <div>
                        <div className="text-3xl font-bold">500+</div>
                        <div className="text-sm text-gray-500 mt-1">
                            Products
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">10k+</div>
                        <div className="text-sm text-gray-500 mt-1">
                            Customers
                        </div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">24/7</div>
                        <div className="text-sm text-gray-500 mt-1">
                            Support
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side form */}
            <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
                <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            {isLogin
                                ? "Login to continue shopping"
                                : "Join us and start shopping fresh"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <Input
                                icon={User}
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        )}
                        <Input
                            icon={Mail}
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {isLogin && (
                            <div className="text-right">
                                <a
                                    href="#"
                                    className="text-xs text-[#9b2c2c] hover:underline">
                                    Forgot Password?
                                </a>
                            </div>
                        )}

                        {!isLogin && (
                            <div className="text-xs text-gray-500 text-center mb-4">
                                I agree to the{" "}
                                <span className="text-[#9b2c2c]">
                                    Terms and Conditions
                                </span>{" "}
                                and{" "}
                                <span className="text-[#9b2c2c]">
                                    Privacy Policy
                                </span>
                            </div>
                        )}

                        <Button type="submit" className="w-full py-3 text-base">
                            {isLogin ? "Login" : "Sign Up"}
                        </Button>
                    </form>

                    {isLogin && (
                        <>
                            <div className="flex items-center my-6">
                                <div className="flex-1 border-t border-gray-200"></div>
                                <span className="px-3 text-xs text-gray-400">
                                    OR
                                </span>
                                <div className="flex-1 border-t border-gray-200"></div>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    variant="outline"
                                    className="w-full flex justify-center gap-2 font-normal text-gray-700 border-gray-200 hover:bg-gray-50">
                                    <img
                                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />{" "}
                                    Continue with Google
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full flex justify-center gap-2 font-normal text-gray-700 border-gray-200 hover:bg-gray-50">
                                    <img
                                        src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                                        alt="Facebook"
                                        className="w-5 h-5"
                                    />{" "}
                                    Continue with Facebook
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="text-center mt-6 text-sm text-gray-600">
                        {isLogin
                            ? "Don't have an account? "
                            : "Already have an account? "}
                        <button
                            onClick={() =>
                                navigate(isLogin ? "signup" : "login")
                            }
                            className="text-[#9b2c2c] font-semibold hover:underline">
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ADMIN LAYOUT & SCREENS ---

const AdminSidebar = ({ currentTab, setTab }) => {
    const { navigate } = useContext(RouterContext);
    const { logout } = useContext(AuthContext);

    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Package },
        { id: "add-product", label: "Add Product", icon: Plus },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
            <div
                className="p-6 border-b border-gray-100"
                onClick={() => navigate("home")}>
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="relative flex items-center justify-center w-8 h-8 bg-[#9b2c2c] rounded-md">
                        <Hexagon
                            className="text-white w-6 h-6 absolute"
                            fill="#9b2c2c"
                        />
                        <Box className="text-white w-4 h-4 relative z-10" />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-[#9b2c2c] leading-tight">
                            FreshMart
                        </div>
                        <div className="text-[10px] text-gray-400">
                            Admin Panel
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${currentTab === tab.id ? "bg-[#9b2c2c] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                        <tab.icon className="w-5 h-5" /> {tab.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={() => {
                        logout();
                        navigate("home");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition">
                    <LogOut className="w-5 h-5" /> Logout
                </button>
            </div>
        </div>
    );
};

const AdminProductsList = ({ onEdit }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.getProducts().then(setProducts);
    }, []);

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            await api.deleteProduct(id);
            setProducts(products.filter((p) => p.id !== id));
        }
    };

    return (
        <>
            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    {
                        label: "Total Products",
                        value: products.length,
                        icon: Box,
                        color: "text-blue-500",
                        bg: "bg-blue-100",
                    },
                    {
                        label: "Total Orders",
                        value: "142",
                        icon: ShoppingCart,
                        color: "text-[#739e54]",
                        bg: "bg-green-100",
                    },
                    {
                        label: "Total Users",
                        value: "1284",
                        icon: User,
                        color: "text-[#9b2c2c]",
                        bg: "bg-red-100",
                    },
                    {
                        label: "Revenue",
                        value: "$12,847",
                        icon: LayoutDashboard,
                        color: "text-purple-500",
                        bg: "bg-purple-100",
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl p-6 shadow-sm flex flex-col justify-center">
                        <div
                            className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                            {stat.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-lg">
                        Product List
                    </h3>
                    <Button
                        className="bg-[#739e54]"
                        variant="secondary"
                        onClick={() => onEdit(null, "add-product")}>
                        <Plus className="w-4 h-4 mr-2" /> Add Product
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr
                                    key={product.id}
                                    className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Box className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-800">
                                            {product.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-[#9b2c2c]">
                                        ${product.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-medium">
                                        {product.stock}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-50 text-[#739e54] rounded-full text-xs font-medium border border-green-200">
                                            In Stock
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() =>
                                                onEdit(product, "edit-product")
                                            }
                                            className="text-blue-500 hover:bg-blue-50 p-1.5 rounded mr-2">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(product.id)
                                            }
                                            className="text-red-500 hover:bg-red-50 p-1.5 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                    <span>
                        Showing 1 to {products.length} of {products.length}{" "}
                        products
                    </span>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            className="px-3 py-1 border border-gray-200">
                            Previous
                        </Button>
                        <Button className="px-3 py-1 !bg-[#9b2c2c]">1</Button>
                        <Button
                            variant="ghost"
                            className="px-3 py-1 border border-gray-200">
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

const AdminProductForm = ({ product, onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        category: product?.category || "",
        price: product?.price || "",
        stock: product?.stock || "",
        description: product?.description || "",
        image: product?.image || "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
        };
        if (product) {
            await api.updateProduct(product.id, data);
        } else {
            await api.createProduct(data);
        }
        onSuccess();
    };

    const handleDelete = async () => {
        if (confirm("Delete this product?")) {
            await api.deleteProduct(product.id);
            onSuccess();
        }
    };

    return (
        <div>
            <button
                onClick={onCancel}
                className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {product ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
                {product
                    ? "Update product details"
                    : "Fill in the product details below"}
            </p>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-3xl">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                        </label>
                        {formData.image && product ? (
                            <div className="flex items-start gap-6">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-lg object-cover"
                                />
                                <div>
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="mb-2">
                                        <Upload className="w-4 h-4 mr-2" />{" "}
                                        Change Image
                                    </Button>
                                    <p className="text-xs text-gray-400">
                                        PNG, JPG up to 5MB
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer">
                                <Upload className="w-8 h-8 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-600">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    PNG, JPG up to 5MB
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="Category"
                                    value={formData.category}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            category: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        className="pl-8"
                                        placeholder="0.00"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                price: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                placeholder="Enter stock quantity"
                                value={formData.stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stock: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                className="w-full bg-white border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#9b2c2c] focus:border-transparent min-h-[120px]"
                                placeholder="Enter product description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }></textarea>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        {product ? (
                            <Button
                                type="button"
                                variant="danger"
                                className="gap-2 bg-[#9b2c2c]"
                                onClick={handleDelete}>
                                <Trash2 className="w-4 h-4" /> Delete Product
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-gray-200 text-gray-600"
                                onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="bg-[#739e54]">
                                {product ? "Update Product" : "Add Product"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminLayout = () => {
    const { user } = useContext(AuthContext);
    const { navigate } = useContext(RouterContext);
    const [tab, setTab] = useState("products");
    const [editProduct, setEditProduct] = useState(null);

    if (!user || user.role !== "admin") {
        return (
            <div className="p-12 text-center text-red-500">
                Access Denied. Admins only.
            </div>
        );
    }

    const handleTabChange = (newTab) => {
        setTab(newTab);
        if (newTab !== "edit-product") setEditProduct(null);
    };

    return (
        <div className={`min-h-screen bg-[${COLORS.bgLight}] flex`}>
            <AdminSidebar currentTab={tab} setTab={handleTabChange} />

            <div className="flex-1 ml-64 flex flex-col h-screen">
                <header className="bg-white h-20 border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="text-gray-400 hover:text-gray-600">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 leading-tight">
                                Products Management
                            </h1>
                            <p className="text-xs text-gray-500">
                                Manage your inventory
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-64">
                            <Input
                                icon={Search}
                                placeholder="Search products..."
                                className="py-2"
                            />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#9b2c2c] text-white flex items-center justify-center font-bold">
                            A
                        </div>
                    </div>
                </header>

                <main
                    className={`flex-1 overflow-auto p-8 bg-[${COLORS.bgLight}]`}>
                    {tab === "dashboard" && (
                        <AdminProductsList
                            onEdit={(p, t) => {
                                setEditProduct(p);
                                setTab(t);
                            }}
                        />
                    )}
                    {tab === "products" && (
                        <AdminProductsList
                            onEdit={(p, t) => {
                                setEditProduct(p);
                                setTab(t);
                            }}
                        />
                    )}
                    {(tab === "add-product" || tab === "edit-product") && (
                        <AdminProductForm
                            product={editProduct}
                            onCancel={() => setTab("products")}
                            onSuccess={() => setTab("products")}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

// --- APP CONTAINER ---

export default function App() {
    const [route, setRoute] = useState({ name: "home", params: {} });
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);

    const navigate = (name, params = {}) => {
        window.scrollTo(0, 0);
        setRoute({ name, params });
    };

    const login = async (email, password) => {
        const user = await api.login(email, password);
        if (!user) throw new Error("Invalid credentials");
        setUser(user);
        const cartData = await api.getCart(user.id);
        setCart(cartData || []);
    };

    const register = async (userData) => {
        const user = await api.register(userData);
        if (!user) throw new Error("Registration failed");
        setUser(user);
    };

    const logout = () => {
        setUser(null);
        setCart([]);
    };

    const addToCart = async (product, quantity) => {
        if (user) {
            const updatedCart = await api.addToCart(
                user.id,
                product.id,
                quantity,
            );
            setCart(updatedCart);
        } else {
            // Local state cart for guest
            setCart((prev) => {
                const existing = prev.find(
                    (item) => item.product.id === product.id,
                );
                if (existing)
                    return prev.map((item) =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item,
                    );
                return [...prev, { id: Date.now(), product, quantity }];
            });
        }
    };

    const updateQuantity = (id, quantity) => {
        setCart((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const renderScreen = () => {
        switch (route.name) {
            case "home":
                return <Home />;
            case "categories":
                return <Categories />;
            case "category":
                return <CategoryProducts params={route.params} />;
            case "product":
                return <ProductDetails params={route.params} />;
            case "cart":
                return <Cart />;
            case "checkout":
                return <Checkout />;
            case "profile":
                return <Profile />;
            case "login":
                return <AuthScreen isLogin={true} />;
            case "signup":
                return <AuthScreen isLogin={false} />;
            case "admin":
                return <AdminLayout />;
            default:
                return <Home />;
        }
    };

    const isFullPageLayout = ["admin", "login", "signup"].includes(route.name);

    return (
        <RouterContext.Provider value={{ route, navigate }}>
            <AuthContext.Provider value={{ user, login, register, logout }}>
                <CartContext.Provider
                    value={{
                        cart,
                        addToCart,
                        updateQuantity,
                        removeFromCart,
                        clearCart,
                    }}>
                    <div className="min-h-screen flex flex-col font-sans bg-white">
                        {!isFullPageLayout && <Header />}

                        <main
                            className={`flex-1 ${!isFullPageLayout ? `bg-[${COLORS.bgLight}]` : ""}`}>
                            {renderScreen()}
                        </main>

                        {!isFullPageLayout && <Footer />}
                    </div>
                </CartContext.Provider>
            </AuthContext.Provider>
        </RouterContext.Provider>
    );
}
