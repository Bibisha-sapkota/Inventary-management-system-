import React, { useState, useEffect } from "react";
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Trash2, Megaphone, Type } from "lucide-react";

const BannerManagement = ({ settings, setSettings, API, hdr, triggerToast }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(settings.discountBanner || null);
  const [title, setTitle] = useState(settings.bannerTitle || "");

  useEffect(() => {
    setPreview(settings.discountBanner);
    setTitle(settings.bannerTitle || "");
  }, [settings]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return alert("Image size must be less than 2MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBanner = async () => {
    if (!title.trim()) return alert("Please enter a Banner Title first!");
    setUploading(true);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { ...hdr(), "Content-Type": "application/json" },
        body: JSON.stringify({ 
          discountBanner: preview,
          bannerTitle: title
        })
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
        alert("Banner published successfully! All customers have been notified.");
      } else {
        alert(json.message || "Failed to update banner");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBanner = () => {
    setPreview("");
  };

  const hasChanges = preview !== settings.discountBanner || title !== settings.bannerTitle;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-gray-900 flex items-center gap-4">
            <Megaphone className="text-indigo-600" size={36} />
            Banner <span className="text-indigo-600">Promotion</span>
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 ml-1">Broadcast Special Offers to Customers</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSaveBanner}
            disabled={uploading}
            className="px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {uploading ? "Publishing..." : "Publish Banner"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 p-8 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Type size={20} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">Promotion Details</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Banner Title (Mandatory)</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 50% OFF SPECIAL SALE"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-indigo-500 transition-all text-gray-800 placeholder:text-gray-300"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-amber-500 shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tight leading-relaxed">
                    Publishing will send a global notification to all customer accounts instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden h-full">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Visual Preview</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live rendering for Customer Dashboard</p>
                </div>
                {preview && (
                  <button 
                    onClick={handleRemoveBanner}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remove Banner"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {preview ? (
                <div className="relative group rounded-[2.5rem] overflow-hidden border-4 border-gray-50 shadow-2xl">
                  <img 
                    src={preview} 
                    alt="Discount Banner" 
                    className="w-full h-[350px] object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                    <h3 className="text-white text-3xl font-black tracking-tight mb-2 drop-shadow-lg">{title || "Your Title Here"}</h3>
                    <p className="text-gray-200 text-xs font-bold uppercase tracking-widest opacity-80">Promotion Active Now</p>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <label className="cursor-pointer bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                      Change Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-[350px] border-4 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-200 transition-all cursor-pointer group">
                  <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-100/50">
                    <Upload size={32} />
                  </div>
                  <p className="text-sm font-black text-gray-900 uppercase tracking-wider">Upload Promotion Banner</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Recommended: 1200 x 500px (Max 2MB)</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
