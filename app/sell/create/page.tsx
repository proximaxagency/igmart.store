"use client";

import { useState, useMemo, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import Link from "next/link";
import {
  Loader2, ChevronDown, Check, ShieldCheck, Zap, Flame, Package,
  Lock, Eye, EyeOff, Pencil, HelpCircle, CheckCircle2, AlertCircle,
  Sparkles, ArrowLeft, ArrowUpRight, Plus, Copy, LogIn, UserPlus, X, Mail
} from "lucide-react";
import { useConvexAuth, useAuthActions } from "@convex-dev/auth/react";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { GAME_FIELDS, type GameField } from "@/lib/gameFields";
import { GAMES } from "@/lib/data/igmartData";

function CreateListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") as Id<"listings"> | null;
  const initialGameSlug = searchParams.get("game") || "clash-of-clans";
  const isEditMode = !!editId;

  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { signIn } = useAuthActions();

  const games = useQuery((api.listings as any).getGames) as any[] | undefined;
  const categories = useQuery((api.listings as any).getCategories) as any[] | undefined;
  const createListing = useMutation((api.listings as any).createListing);
  const updateListing = useMutation((api.listings as any).updateListing);

  // Load existing listing data in edit mode
  const existingListing = useQuery(
    (api.listings as any).getListingById,
    editId ? { listingId: editId } : "skip"
  ) as any;

  // Active games list with fallbacks
  const activeGames = useMemo(() => {
    if (!games || games.length === 0) {
      return GAMES.map((g) => ({
        _id: (g.slug === "pokemon-go" ? "jh7f1zgy0v8z7ep35g54zr8nt58ezg01" : g.id) as any,
        name: g.name,
        slug: g.slug,
        category: g.category,
        imageUrl: g.image,
        isActive: true,
        isPopular: g.popular,
      }));
    }

    const mapped = games.map((g) => {
      const slug = (g.slug || "").toLowerCase();
      const name = (g.name || "").toLowerCase();
      if (slug.includes("pubg") || slug.includes("bgmi") || name.includes("pubg") || name.includes("bgmi")) {
        return {
          ...g,
          name: "Pokémon GO",
          slug: "pokemon-go",
          category: "AR / Adventure",
          imageUrl: "/pokemon-go-poster.png",
          isPopular: true,
          isActive: true,
        };
      }
      return g;
    });

    const hasPokemon = mapped.some((g) => (g.slug || "").toLowerCase() === "pokemon-go");
    if (!hasPokemon) {
      mapped.push({
        _id: "jh7f1zgy0v8z7ep35g54zr8nt58ezg01" as any,
        name: "Pokémon GO",
        slug: "pokemon-go",
        category: "AR / Adventure",
        imageUrl: "/pokemon-go-poster.png",
        isPopular: true,
        isActive: true,
      });
    }

    return mapped.filter((g) => {
      const slug = (g.slug || "").toLowerCase();
      const name = (g.name || "").toLowerCase();
      return !slug.includes("pubg") && !slug.includes("bgmi") && !name.includes("pubg") && !name.includes("bgmi");
    });
  }, [games]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    gameId: initialGameSlug as any,
    categoryId: "" as Id<"categories"> | "",
    deliveryMethod: "automatic" as "automatic" | "manual" | "coordinate",
    deliveryTime: "Instant",
  });

  // Game-specific offer details
  const [gameDetails, setGameDetails] = useState<Record<string, any>>({});

  // Automated Delivery Credentials (Screenshot 2)
  const [credentials, setCredentials] = useState({
    accountLogin: "",
    accountPassword: "",
    emailProviderUrl: "",
    emailLogin: "",
    emailPassword: "",
    twoFactorLogin: "",
    twoFactorPassword: "",
    additionalInfo: "",
  });

  // Visibility states for passwords
  const [showAccountPass, setShowAccountPass] = useState(false);
  const [showEmailPass, setShowEmailPass] = useState(false);
  const [showTwoFactorPass, setShowTwoFactorPass] = useState(false);

  // Game selector dropdown state
  const [gameSelectorOpen, setGameSelectorOpen] = useState(false);
  const gameSelectorRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadAnother, setUploadAnother] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // In-page Auth Modal state to prevent unauthorized errors
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Close game selector on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gameSelectorRef.current && !gameSelectorRef.current.contains(event.target as Node)) {
        setGameSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync real Convex gameId once database query resolves
  useEffect(() => {
    if (activeGames && activeGames.length > 0) {
      const matched = activeGames.find((g) => g.slug === formData.gameId || g._id === formData.gameId);
      if (matched && matched._id !== formData.gameId) {
        setFormData((prev) => ({ ...prev, gameId: matched._id }));
      }
    }
  }, [activeGames, formData.gameId]);

  useEffect(() => {
    if (!formData.categoryId && categories && categories.length > 0) {
      const accountsCat = categories.find((c) => c.slug === "accounts") || categories[0];
      setFormData((prev) => ({ ...prev, categoryId: accountsCat._id }));
    }
  }, [categories, formData.categoryId]);

  // Restore draft from localStorage if present (for guest users or refreshed pages)
  useEffect(() => {
    if (!isEditMode && typeof window !== "undefined") {
      try {
        const savedDraft = localStorage.getItem("igmart_sell_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.price || Object.keys(parsed.gameDetails || {}).length > 0) {
            setFormData((prev) => ({
              ...prev,
              title: parsed.title || prev.title,
              description: parsed.description || prev.description,
              price: parsed.price || prev.price,
              gameId: parsed.gameId || prev.gameId,
              categoryId: parsed.categoryId || prev.categoryId,
              deliveryMethod: parsed.deliveryMethod || prev.deliveryMethod,
              deliveryTime: parsed.deliveryTime || prev.deliveryTime,
            }));
            if (parsed.gameDetails) setGameDetails(parsed.gameDetails);
            if (parsed.credentials) setCredentials(parsed.credentials);
            if (parsed.uploadedImages && parsed.uploadedImages.length > 0) {
              setUploadedImages(parsed.uploadedImages);
            }
          }
        }
      } catch (err) {
        console.warn("Could not read local draft:", err);
      }
    }
  }, [isEditMode]);

  // Auto-save draft to localStorage whenever fields change
  useEffect(() => {
    if (!isEditMode && typeof window !== "undefined") {
      const draft = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        gameId: formData.gameId,
        categoryId: formData.categoryId,
        deliveryMethod: formData.deliveryMethod,
        deliveryTime: formData.deliveryTime,
        gameDetails,
        credentials,
        uploadedImages,
      };
      try {
        localStorage.setItem("igmart_sell_draft", JSON.stringify(draft));
      } catch (e) {
        // storage quota exceeded or disabled
      }
    }
  }, [formData, gameDetails, credentials, uploadedImages, isEditMode]);

  // Pre-fill form when editing an existing listing
  useEffect(() => {
    if (isEditMode && existingListing && !prefilled) {
      setFormData({
        title: existingListing.title || "",
        description: existingListing.description || "",
        price: existingListing.price?.toString() || "",
        gameId: (existingListing.gameId as Id<"games">) || "",
        categoryId: (existingListing.categoryId as Id<"categories">) || "",
        deliveryMethod: (existingListing.deliveryMethod as any) || "automatic",
        deliveryTime: existingListing.deliveryTime || "Instant",
      });

      const rawImgs = (existingListing as any).rawImages as string[] | undefined;
      setUploadedImages(rawImgs && rawImgs.length > 0 ? rawImgs : existingListing.images || []);

      if (existingListing.attributes) {
        setGameDetails(existingListing.attributes as Record<string, any>);
      }

      const rawAuto = (existingListing as any).autoDeliveryData || "";
      if (rawAuto) {
        try {
          const parsed = JSON.parse(rawAuto);
          if (parsed.accountLogin !== undefined || parsed.account !== undefined) {
            setCredentials({
              accountLogin: parsed.account?.login || parsed.accountLogin || "",
              accountPassword: parsed.account?.password || parsed.accountPassword || "",
              emailProviderUrl: parsed.email?.providerUrl || parsed.emailProviderUrl || "",
              emailLogin: parsed.email?.login || parsed.emailLogin || "",
              emailPassword: parsed.email?.password || parsed.emailPassword || "",
              twoFactorLogin: parsed.twoFactor?.login || parsed.twoFactorLogin || "",
              twoFactorPassword: parsed.twoFactor?.password || parsed.twoFactorPassword || "",
              additionalInfo: parsed.additionalInfo || "",
            });
          } else {
            setCredentials((p) => ({ ...p, additionalInfo: rawAuto }));
          }
        } catch {
          const lines = rawAuto.split("\n");
          let accL = "", accP = "", eUrl = "", eL = "", eP = "", twoL = "", twoP = "", rest: string[] = [];
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.toLowerCase().startsWith("login:") && !accL) accL = trimmed.substring(6).trim();
            else if (trimmed.toLowerCase().startsWith("password:") && !accP) accP = trimmed.substring(9).trim();
            else if (trimmed.toLowerCase().startsWith("provider url:")) eUrl = trimmed.substring(13).trim();
            else if (trimmed.toLowerCase().startsWith("email login:")) eL = trimmed.substring(12).trim();
            else if (trimmed.toLowerCase().startsWith("email password:")) eP = trimmed.substring(15).trim();
            else if (trimmed.toLowerCase().startsWith("2fa key / login:") || trimmed.toLowerCase().startsWith("2fa login:")) twoL = trimmed.split(":")[1]?.trim() || "";
            else if (trimmed.toLowerCase().startsWith("2fa backup code / password:") || trimmed.toLowerCase().startsWith("2fa password:")) twoP = trimmed.split(":")[1]?.trim() || "";
            else rest.push(line);
          }
          setCredentials({
            accountLogin: accL,
            accountPassword: accP,
            emailProviderUrl: eUrl,
            emailLogin: eL,
            emailPassword: eP,
            twoFactorLogin: twoL,
            twoFactorPassword: twoP,
            additionalInfo: rest.join("\n").trim(),
          });
        }
      }

      setPrefilled(true);
    }
  }, [isEditMode, existingListing, prefilled]);

  const selectedGame = useMemo(() => {
    if (!activeGames || activeGames.length === 0) return null;
    return activeGames.find((g) => g._id === formData.gameId || g.slug === formData.gameId) || activeGames[0];
  }, [formData.gameId, activeGames]);

  const gameConfig = useMemo(() => {
    if (!selectedGame) return null;
    return GAME_FIELDS[selectedGame.slug] || null;
  }, [selectedGame]);

  const handleGameSelect = (gameId: string) => {
    setFormData((prev) => ({ ...prev, gameId: gameId as any }));
    if (!isEditMode) setGameDetails({});
    setGameSelectorOpen(false);
  };

  const handleDetailChange = (key: string, value: any) => {
    setGameDetails((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-generate title matching Eldorado style
  const autoTitle = useMemo(() => {
    if (!selectedGame) return "";
    const g = gameDetails;
    const slug = selectedGame.slug;

    if (slug === "clash-of-clans") {
      const parts: string[] = [];
      if (g.townHallLevel && g.townHallLevel !== "Town Hall") parts.push(g.townHallLevel);
      if (g.maxedAccount && g.maxedAccount !== "Maxed Account" && g.maxedAccount !== "No") parts.push(g.maxedAccount);
      if (g.currentRank && g.currentRank !== "Current Rank" && g.currentRank !== "Unranked") parts.push(g.currentRank);
      if (g.gems && g.gems !== "Gems") parts.push(`${g.gems} Gems`);
      if (g.originalEmail && g.originalEmail.toLowerCase().includes("yes")) parts.push("Clean Full Access Email");

      return parts.length > 0 ? parts.join(" · ") : `${selectedGame.name} Account`;
    }

    if (slug === "free-fire") {
      const parts: string[] = [];
      if (g.rank && g.rank !== "Current Rank") parts.push(g.rank);
      if (g.accountLevel) parts.push(`Lv.${g.accountLevel}`);
      if (g.evoGuns && g.evoGuns !== "None") parts.push(g.evoGuns);
      if (g.diamonds && g.diamonds !== "Diamonds") parts.push(`${g.diamonds} Diamonds`);
      return parts.length > 0 ? `FF ${parts.join(" · ")}` : `${selectedGame.name} Account`;
    }

    if (slug === "pokemon-go") {
      const parts: string[] = [];
      if (g.trainerLevel && g.trainerLevel !== "Trainer Level") parts.push(g.trainerLevel);
      if (g.team && g.team !== "Team") parts.push(g.team.split(" ")[0]);
      if (g.shinyCount) parts.push(`${g.shinyCount} Shinies`);
      if (g.stardust) parts.push(`${(Number(g.stardust) / 1000000).toFixed(1)}M Stardust`);
      return parts.length > 0 ? `Pokémon GO ${parts.join(" · ")}` : `${selectedGame.name} Account`;
    }

    if (slug === "roblox") {
      const parts: string[] = [];
      if (g.accountAge) parts.push(`${g.accountAge}yr Old`);
      if (g.robux) parts.push(`${g.robux} Robux`);
      if (g.bloxFruitsProgress && g.bloxFruitsProgress !== "Not played") parts.push("Blox Fruits Max");
      return parts.length > 0 ? `Roblox ${parts.join(" · ")}` : `${selectedGame.name} Account`;
    }

    if (slug === "clash-royale") {
      const parts: string[] = [];
      if (g.kingLevel) parts.push(`King Level ${g.kingLevel}`);
      if (g.currentRank && g.currentRank !== "Current Rank") parts.push(g.currentRank);
      if (g.gems && g.gems !== "Gems") parts.push(`${g.gems} Gems`);
      return parts.length > 0 ? `Clash Royale ${parts.join(" · ")}` : `${selectedGame.name} Account`;
    }

    return `${selectedGame.name} Account`;
  }, [selectedGame, gameDetails]);

  // Serialized delivery payload
  const buildDeliveryPayload = () => {
    const hasCreds = credentials.accountLogin || credentials.accountPassword || credentials.additionalInfo;
    if (!hasCreds) return "";

    return JSON.stringify({
      account: {
        login: credentials.accountLogin.trim(),
        password: credentials.accountPassword.trim(),
      },
      email: {
        providerUrl: credentials.emailProviderUrl.trim(),
        login: credentials.emailLogin.trim(),
        password: credentials.emailPassword.trim(),
      },
      twoFactor: {
        login: credentials.twoFactorLogin.trim(),
        password: credentials.twoFactorPassword.trim(),
      },
      additionalInfo: credentials.additionalInfo.trim(),
      deliveredAt: Date.now(),
    });
  };

  const handleInPageAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authMode === "signIn") {
        await signIn("password", {
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          flow: "signIn",
        });
      } else {
        await signIn("password", {
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          username: (authUsername || authEmail.split("@")[0]).trim().toLowerCase(),
          flow: "signUp",
        });
      }
      setShowAuthModal(false);
      setSuccessToast("Signed in successfully! You can now publish your listing.");
    } catch (err: any) {
      setAuthError(err?.message?.includes("Invalid") ? "Incorrect email or password." : (err?.message || "Sign in failed."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // ── AUTH CHECK: PREVENT UNAUTHORIZED CRASH ──
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!formData.gameId || !formData.categoryId) {
      setErrorMessage("Please select a game and category.");
      return;
    }

    const finalTitle = formData.title || autoTitle;
    if (!finalTitle || !formData.price) {
      setErrorMessage("Please fill in both listing title and price.");
      return;
    }

    setIsSubmitting(true);
    const autoDeliveryString = buildDeliveryPayload();

    try {
      if (isEditMode && editId) {
        const editArgs: Record<string, any> = {
          listingId: editId,
          title: finalTitle.substring(0, 160),
          description: formData.description || buildAutoDescription(selectedGame?.slug || "", gameDetails),
          price: parseFloat(formData.price),
          deliveryMethod: formData.deliveryMethod,
          deliveryTime: formData.deliveryTime,
        };
        if (formData.gameId) editArgs.gameId = formData.gameId;
        if (formData.categoryId) editArgs.categoryId = formData.categoryId;
        if (autoDeliveryString) editArgs.autoDeliveryData = autoDeliveryString;
        if (uploadedImages.length > 0) editArgs.images = uploadedImages;
        if (Object.keys(gameDetails).length > 0) editArgs.attributes = gameDetails;

        await updateListing(editArgs as any);
        if (typeof window !== "undefined") localStorage.removeItem("igmart_sell_draft");
        router.push("/seller/listings");
      } else {
        const newListingId = await createListing({
          title: finalTitle.substring(0, 160),
          description: formData.description || buildAutoDescription(selectedGame?.slug || "", gameDetails),
          price: parseFloat(formData.price),
          gameId: formData.gameId as Id<"games">,
          categoryId: formData.categoryId as Id<"categories">,
          deliveryMethod: formData.deliveryMethod,
          deliveryTime: formData.deliveryTime,
          autoDeliveryData: autoDeliveryString || undefined,
          images: uploadedImages.length > 0 ? uploadedImages : [selectedGame?.imageUrl ?? "/clash-of-clans-poster.jpg"],
          attributes: Object.keys(gameDetails).length > 0 ? gameDetails : undefined,
        });

        if (typeof window !== "undefined") localStorage.removeItem("igmart_sell_draft");

        if (uploadAnother) {
          setFormData((prev) => ({
            ...prev,
            title: "",
            description: "",
            price: "",
          }));
          setGameDetails({});
          setCredentials({
            accountLogin: "",
            accountPassword: "",
            emailProviderUrl: "",
            emailLogin: "",
            emailPassword: "",
            twoFactorLogin: "",
            twoFactorPassword: "",
            additionalInfo: "",
          });
          setUploadedImages([]);
          setSuccessToast("🎉 Listing published! It's now live on the marketplace. Create another below.");
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          router.push(`/seller/dashboard?success=listing_created&id=${newListingId}`);
        }
      }
    } catch (error: any) {
      console.error("Failed to save listing:", error);
      const msg = error?.message || `${error}`;
      if (msg.includes("Authentication required") || msg.includes("Unauthorized")) {
        setShowAuthModal(true);
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fee calculation (Eldorado 5% seller fee)
  const numPrice = parseFloat(formData.price) || 0;
  const platformFee = numPrice * 0.05;
  const sellerReceives = Math.max(0, numPrice - platformFee);

  // Primary Offer Details for Eldorado style
  const primaryOfferFields = useMemo(() => {
    if (!gameConfig) return [];
    return gameConfig.fields.slice(0, 5);
  }, [gameConfig]);

  const secondaryOfferFields = useMemo(() => {
    if (!gameConfig) return [];
    return gameConfig.fields.slice(5);
  }, [gameConfig]);

  // Loading state
  if (isEditMode && existingListing === undefined) {
    return (
      <div className="min-h-screen bg-[#0c0e14] py-20 flex items-center justify-center gap-3 text-slate-400">
        <Loader2 className="animate-spin text-blue-500" size={24} />
        <span className="font-semibold text-sm">Loading listing details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Top Bar: Sell Game Accounts Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/seller/dashboard"
                className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Seller Hub
              </Link>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {isEditMode ? "Edit Game Account Offer" : "Sell Game Accounts"}
            </h1>
          </div>

          {/* Game Selector Badge / Dropdown (Eldorado style) */}
          <div className="relative" ref={gameSelectorRef}>
            <button
              type="button"
              onClick={() => setGameSelectorOpen(!gameSelectorOpen)}
              className="flex items-center gap-3 bg-[#151824] hover:bg-[#1a1f30] border border-[#23293c] hover:border-[#333d59] rounded-xl px-4 py-2.5 transition-all shadow-md group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 relative border border-slate-700/60 shrink-0">
                {selectedGame?.imageUrl ? (
                  <Image
                    src={selectedGame.imageUrl}
                    alt={selectedGame.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-blue-600">
                    {selectedGame?.name?.slice(0, 2) || "GA"}
                  </div>
                )}
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Game</span>
                <span className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                  {selectedGame?.name || "Select Game"}
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${gameSelectorOpen ? "rotate-180" : ""}`} />
                </span>
              </div>
            </button>

            {/* Dropdown Menu */}
            {gameSelectorOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#151824] border border-[#2a324b] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-[#23293c] mb-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Game</p>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {activeGames.map((game) => {
                    const isSelected = game._id === formData.gameId || game.slug === formData.gameId;
                    return (
                      <button
                        key={game._id}
                        type="button"
                        onClick={() => handleGameSelect(game._id)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-600/15 border border-blue-500/30 text-white"
                            : "hover:bg-[#1c2233] text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-800 relative border border-slate-700/60 shrink-0">
                          {game.imageUrl && (
                            <Image src={game.imageUrl} alt={game.name} fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-white">{game.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{game.category || "Gaming Account"}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Guest Info Banner ── */}
        {!isAuthLoading && !isAuthenticated && (
          <div className="bg-[#1a1f2e] border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-white">Fill out your listing — sign in when ready to publish</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your draft auto-saves locally. Sign in or register instantly before publishing.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="shrink-0 bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn size={13} /> Quick Sign In
            </button>
          </div>
        )}

        {/* ── Inline Feedback Notifications ── */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {successToast && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              CARD 1: OFFER DETAILS (Matching Screenshot 1)
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-white">Offer Details</h2>
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {selectedGame?.name}
              </span>
            </div>

            <div className="space-y-4">
              {primaryOfferFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                      <span>{field.label}:</span>
                      {field.required && <span className="text-rose-500">*</span>}
                      {field.tooltip && (
                        <div className="relative inline-flex items-center group">
                          <HelpCircle
                            size={14}
                            className="text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                            onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
                          />
                          <div className={`absolute left-0 bottom-full mb-2 w-64 p-3 bg-[#0c0e14] border border-[#2a324b] text-slate-300 text-xs rounded-xl shadow-2xl transition-opacity pointer-events-none z-30 ${
                            activeTooltip === field.key ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          }`}>
                            <p className="font-semibold text-white mb-1">{field.label}</p>
                            {field.tooltip}
                          </div>
                        </div>
                      )}
                    </label>
                    {field.hint && (
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{field.hint}</span>
                    )}
                  </div>

                  {field.type === "select" ? (
                    <div className="relative">
                      <select
                        value={gameDetails[field.key] || ""}
                        onChange={(e) => handleDetailChange(field.key, e.target.value)}
                        required={field.required}
                        className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 outline-none transition-all appearance-none cursor-pointer pr-10"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt === field.placeholder ? "" : opt} className="bg-[#1b202e] text-slate-100">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                    </div>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder || "Type here..."}
                      value={gameDetails[field.key] || ""}
                      onChange={(e) => handleDetailChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                      required={field.required}
                      className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  )}
                </div>
              ))}

              {/* Secondary fields (Hero levels, equipment, toggles) */}
              {secondaryOfferFields.length > 0 && (
                <div className="pt-4 border-t border-[#23293c]/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {secondaryOfferFields.map((field) => (
                    <div key={field.key} className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.hint && <span className="text-[10px] text-slate-400">{field.hint}</span>}
                      </label>

                      {field.type === "toggle" ? (
                        <button
                          type="button"
                          onClick={() => handleDetailChange(field.key, !gameDetails[field.key])}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            gameDetails[field.key]
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-[#1b202e] border-[#2b334a] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <span>{gameDetails[field.key] ? "Ready / Verified" : "Not Set"}</span>
                          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${gameDetails[field.key] ? "bg-emerald-500" : "bg-slate-700"}`}>
                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${gameDetails[field.key] ? "translate-x-4" : "translate-x-0"}`} />
                          </div>
                        </button>
                      ) : field.type === "select" ? (
                        <div className="relative">
                          <select
                            value={gameDetails[field.key] || ""}
                            onChange={(e) => handleDetailChange(field.key, e.target.value)}
                            className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-3.5 py-3 text-xs text-slate-100 outline-none transition-all appearance-none cursor-pointer pr-8"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt === field.placeholder ? "" : opt} className="bg-[#1b202e]">
                                {opt}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                      ) : (
                        <input
                          type={field.type === "number" ? "number" : "text"}
                          placeholder={field.placeholder || "Type here..."}
                          value={gameDetails[field.key] || ""}
                          onChange={(e) => handleDetailChange(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                          className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 2: OFFER TITLE (Matching Screenshot 1)
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-bold text-lg text-white">Offer Title</h2>
              <span className={`text-xs font-mono font-medium ${
                formData.title.length > 150 ? "text-amber-400 font-bold" : "text-slate-400"
              }`}>
                {formData.title.length}/160
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                maxLength={160}
                placeholder="Type here..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Quick Auto-Fill suggestion */}
            {autoTitle && !formData.title && (
              <div className="mt-3 flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles size={14} className="text-blue-400 shrink-0" />
                  <p className="truncate text-slate-300">
                    <span className="font-bold text-blue-400">Suggestion:</span> {autoTitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, title: autoTitle.substring(0, 160) })}
                  className="shrink-0 text-blue-400 hover:text-blue-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Copy size={12} /> Apply
                </button>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 3: AUTOMATED DELIVERY VAULT (Matching Screenshot 2)
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl overflow-hidden shadow-xl">
            {/* Dark Navy Tab / Bar */}
            <div className="bg-[#1e2738] border-b border-[#2b334a] px-6 py-3.5 flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-white tracking-wide">
                Account #1
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={11} /> Instant Automated Vault
              </span>
            </div>

            <div className="p-6 sm:p-7 space-y-6">

              {/* Account details (Required) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Account details <span className="text-slate-400 font-normal text-xs">(Required)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Login</label>
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={credentials.accountLogin}
                      onChange={(e) => setCredentials({ ...credentials, accountLogin: e.target.value })}
                      className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        type={showAccountPass ? "text" : "password"}
                        placeholder="Type here..."
                        value={credentials.accountPassword}
                        onChange={(e) => setCredentials({ ...credentials, accountPassword: e.target.value })}
                        className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAccountPass(!showAccountPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showAccountPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email details (Optional) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white">
                  Email details <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Provider URL</label>
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={credentials.emailProviderUrl}
                      onChange={(e) => setCredentials({ ...credentials, emailProviderUrl: e.target.value })}
                      className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Login</label>
                      <input
                        type="text"
                        placeholder="Type here..."
                        value={credentials.emailLogin}
                        onChange={(e) => setCredentials({ ...credentials, emailLogin: e.target.value })}
                        className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <div className="relative">
                        <input
                          type={showEmailPass ? "text" : "password"}
                          placeholder="Type here..."
                          value={credentials.emailPassword}
                          onChange={(e) => setCredentials({ ...credentials, emailPassword: e.target.value })}
                          className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPass(!showEmailPass)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showEmailPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2FA details (Optional) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-white">
                  2FA details <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Login</label>
                    <input
                      type="text"
                      placeholder="Type here..."
                      value={credentials.twoFactorLogin}
                      onChange={(e) => setCredentials({ ...credentials, twoFactorLogin: e.target.value })}
                      className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <input
                        type={showTwoFactorPass ? "text" : "password"}
                        placeholder="Type here..."
                        value={credentials.twoFactorPassword}
                        onChange={(e) => setCredentials({ ...credentials, twoFactorPassword: e.target.value })}
                        className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowTwoFactorPass(!showTwoFactorPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {showTwoFactorPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional info (Optional) */}
              <div className="space-y-1.5 pt-2">
                <h3 className="text-sm font-bold text-white">
                  Additional info <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                </h3>
                <textarea
                  rows={3}
                  placeholder="Type here..."
                  value={credentials.additionalInfo}
                  onChange={(e) => setCredentials({ ...credentials, additionalInfo: e.target.value })}
                  className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-y"
                />
              </div>

              {/* Escrow Vault Protection Note */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                <ShieldCheck size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  Credentials in this vault are encrypted and revealed automatically to the buyer only after payment confirmation.
                </p>
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 4: OFFER DESCRIPTION
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-bold text-lg text-white">Offer Description</h2>
              <span className="text-xs font-mono text-slate-400">{formData.description.length}/2000</span>
            </div>

            <textarea
              rows={5}
              maxLength={2000}
              placeholder="Type here..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-y"
            />

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  description: buildAutoDescription(selectedGame?.slug || "", gameDetails),
                })}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} /> Auto-fill description from Offer Details
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 5: PRICE & DELIVERY SETTINGS
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl p-6 sm:p-7 shadow-xl">
            <h2 className="font-heading font-bold text-lg text-white mb-5">Price & Delivery</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">

              {/* Price input */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-200 block mb-1.5">
                    Listing Price (USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-[#1b202e] border border-[#2b334a] hover:border-[#3b4766] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-9 pr-4 py-3.5 text-lg font-bold text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="text-sm font-semibold text-slate-200 block mb-1.5">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryMethod: "automatic" })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        formData.deliveryMethod === "automatic"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-[#1b202e] border-[#2b334a] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Zap size={14} className="mb-1 text-blue-400" />
                      <div>Instant Delivery</div>
                      <span className="text-[10px] font-normal opacity-80">Via Account #1 Vault</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, deliveryMethod: "manual" })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        formData.deliveryMethod === "manual"
                          ? "bg-blue-600/20 border-blue-500 text-white"
                          : "bg-[#1b202e] border-[#2b334a] text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <ShieldCheck size={14} className="mb-1 text-emerald-400" />
                      <div>Manual Transfer</div>
                      <span className="text-[10px] font-normal opacity-80">Coordinate via chat</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Eldorado Fee Calculator */}
              <div className="bg-[#1b202e] border border-[#2b334a] rounded-2xl p-5 space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Buyer Pays:</span>
                  <span className="font-bold text-white">${numPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-3 border-b border-[#2b334a]">
                  <span className="text-slate-400">Platform Fee (5%):</span>
                  <span className="font-medium text-slate-400">-${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">You Receive:</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Available for instant payout</span>
                  </div>
                  <span className="font-heading font-black text-2xl text-emerald-400">
                    ${sellerReceives.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 6: SCREENSHOTS & MEDIA
          ══════════════════════════════════════════════════════════════ */}
          <div className="bg-[#151824] border border-[#23293c] rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg text-white">Screenshots & Proof</h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live Upload
              </span>
            </div>

            <ImageUploader
              value={uploadedImages}
              onChange={setUploadedImages}
              maxImages={5}
              label="Account Screenshots"
            />
            <p className="text-xs text-slate-400 mt-3">
              Listings with clear proof screenshots sell up to 3× faster.
            </p>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM ACTION BAR
          ══════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4 pt-2 pb-10">
            {!isEditMode && (
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="uploadAnother"
                  checked={uploadAnother}
                  onChange={(e) => setUploadAnother(e.target.checked)}
                  className="accent-blue-600 w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="uploadAnother" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Upload another account for this game (keeps game & category selected)
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-400">
                By publishing, you agree to our{" "}
                <Link href="/legal/terms" className="text-blue-400 hover:underline">Seller Agreement</Link> and Escrow Protection rules.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl border border-[#2b334a] bg-[#1b202e] hover:bg-[#222a3d] text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.gameId || !formData.price}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold px-8 py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/25 text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                  ) : isEditMode ? (
                    <><Pencil size={16} /> Save Changes</>
                  ) : (
                    <><Flame size={16} /> Publish Listing</>
                  )}
                </button>
              </div>
            </div>
          </div>

        </form>

        {/* ══════════════════════════════════════════════════════════════
            IN-PAGE AUTH MODAL (PREVENTS UNAUTHORIZED DISRUPTION)
        ══════════════════════════════════════════════════════════════ */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#151824] border border-[#2b334a] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto mb-3">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-heading font-black text-xl text-white">
                  {authMode === "signIn" ? "Sign In to Publish Listing" : "Create Seller Account"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                  Your listing data is saved. Sign in or register to publish your offer to buyers.
                </p>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-2 bg-[#1b202e] border border-[#2b334a] rounded-xl p-1 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signIn"); setAuthError(""); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === "signIn" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signUp"); setAuthError(""); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === "signUp" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle size={15} className="shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleInPageAuth} className="space-y-4">
                {authMode === "signUp" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300 block">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ClashTrader_99"
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-[#1b202e] border border-[#2b334a] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#1b202e] border border-[#2b334a] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#1b202e] border border-[#2b334a] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !authEmail || !authPassword}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {authLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Authenticating...</>
                  ) : authMode === "signIn" ? (
                    <><LogIn size={16} /> Sign In &amp; Continue</>
                  ) : (
                    <><UserPlus size={16} /> Create Account &amp; Continue</>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-[#23293c] text-center">
                <Link
                  href={`/login?redirect=/sell/create`}
                  className="text-xs text-slate-400 hover:text-blue-400 hover:underline"
                >
                  Or visit the dedicated login page →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="h-16"></div>
      </div>
    </div>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0e14] py-20 flex items-center justify-center gap-3 text-slate-400">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <span className="font-semibold text-sm">Loading listing form...</span>
        </div>
      }
    >
      <CreateListingContent />
    </Suspense>
  );
}

function buildAutoDescription(slug: string, details: Record<string, any>): string {
  const lines: string[] = ["=== ACCOUNT SPECIFICATIONS ==="];
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined || value === "" || value === 0 || value === "Select" || value === "Current Rank") continue;
    const label = key.replace(/([A-Z])/g, " $1").trim();
    lines.push(`• ${label}: ${typeof value === "boolean" ? (value ? "Yes" : "No") : value}`);
  }
  lines.push("\n=== WARRANTY & DELIVERY ===");
  lines.push("• Instant automatic delivery with escrow protection.");
  lines.push("• 100% verified credentials with clean email transfer.");
  return lines.join("\n");
}
