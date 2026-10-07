'use client';

import React, { useState, useEffect } from 'react';

type DataSource = 'DATABASE' | 'AUTODEV' | 'CARIMAGES' | 'CUSTOM';
type CategoryFilter = 'all' | 'CAR' | 'BIKE';

interface VehicleCardItem {
  id: string;
  name: string;
  slug: string;
  category: 'CAR' | 'BIKE';
  brandName: string;
  brandSlug: string;
  bodyType: string;
  currentHeroImage: string;
  displayImage: string;
  sourceStatus: string;
}

export default function MediaStudioPage() {
  const [mounted, setMounted] = useState(false);
  const [source, setSource] = useState<DataSource>('DATABASE');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedBodyType, setSelectedBodyType] = useState('all');

  const [apiKeys, setApiKeys] = useState<{ [key in DataSource]?: string }>({
    AUTODEV: '',
    CARIMAGES: '',
    CUSTOM: '',
  });
  const [customBaseUrl, setCustomBaseUrl] = useState('');
  const [showApiSettings, setShowApiSettings] = useState(true);

  const [vehicles, setVehicles] = useState<VehicleCardItem[]>([]);
  const [brands, setBrands] = useState<{ name: string; slug: string; vehicleType?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [uploadModalVehicle, setUploadModalVehicle] = useState<VehicleCardItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('CARBIKE_STUDIO_API_KEYS');
    const savedCustomUrl = localStorage.getItem('CARBIKE_STUDIO_CUSTOM_URL');
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {}
    }
    if (savedCustomUrl) {
      setCustomBaseUrl(savedCustomUrl);
    } else {
      setCustomBaseUrl('https://api.carapis.com/apix/catalog_api/vehicles');
    }
    setMounted(true);
  }, []);

  const handleKeyChange = (provider: DataSource, value: string) => {
    const updated = { ...apiKeys, [provider]: value.trim() };
    setApiKeys(updated);
    localStorage.setItem('CARBIKE_STUDIO_API_KEYS', JSON.stringify(updated));
  };

  const handleCustomUrlChange = (value: string) => {
    setCustomBaseUrl(value.trim());
    localStorage.setItem('CARBIKE_STUDIO_CUSTOM_URL', value.trim());
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const activeKey = (source === 'CUSTOM' ? apiKeys.CUSTOM : apiKeys[source]) || '';
      const params = new URLSearchParams({
        source,
        category,
        brand: selectedBrand,
        bodyType: selectedBodyType,
        apiKey: activeKey,
        baseUrl: customBaseUrl,
        _timestamp: Date.now().toString(),
      });

      const res = await fetch(`/api/admin/vehicle-media?${params.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
        if (data.brands) setBrands(data.brands);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchVehicles();
    }
  }, [mounted, source, category, selectedBrand, selectedBodyType]);

  const handleApplyImage = async (vehicle: VehicleCardItem) => {
    setUpdatingId(vehicle.id);
    try {
      const res = await fetch('/api/admin/vehicle-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          imageUrl: vehicle.displayImage,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicle.id ? { ...v, currentHeroImage: data.heroImage } : v))
        );
        alert(`Successfully set picture for ${vehicle.name}!`);
      }
    } catch (e) {
      alert('Failed to update picture.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadModalVehicle || !uploadFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('vehicleId', uploadModalVehicle.id);
      formData.append('file', uploadFile);

      const res = await fetch('/api/admin/vehicle-media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === uploadModalVehicle.id
              ? { ...v, currentHeroImage: data.heroImage, displayImage: data.heroImage }
              : v
          )
        );
        alert(`Uploaded picture for ${uploadModalVehicle.name}!`);
        setUploadModalVehicle(null);
        setUploadFile(null);
      }
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center text-stone-500 font-medium">
        Loading Vehicle Media Studio...
      </div>
    );
  }

  const filteredBrands = brands.filter((b) => {
    if (category === 'all') return true;
    return b.vehicleType === category || !b.vehicleType;
  });

  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-10 font-sans text-stone-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-xs border border-stone-200">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-stone-900">
              Vehicle Media Studio
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Select an API source, review matching photos, and update your site thumbnails.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* 4-Way Source Switcher */}
            <div className="inline-flex p-1.5 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                onClick={() => setSource('DATABASE')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  source === 'DATABASE'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Database
              </button>
              <button
                onClick={() => setSource('AUTODEV')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  source === 'AUTODEV'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Auto.dev
              </button>
              <button
                onClick={() => setSource('CARIMAGES')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  source === 'CARIMAGES'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                3. CarImages API
              </button>
              <button
                onClick={() => setSource('CUSTOM')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  source === 'CUSTOM'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                4. Custom / CarAPIs
              </button>
            </div>

            <button
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-stone-900 text-white hover:bg-black transition-colors"
            >
              ⚙️ {showApiSettings ? 'Hide Settings' : 'Configure API Keys'}
            </button>
          </div>
        </div>

        {/* API Settings Drawer */}
        {showApiSettings && (
          <div className="bg-stone-900 text-stone-100 p-6 rounded-3xl shadow-md border border-stone-800 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-300">
                API Credentials & Provider Configuration
              </h2>
              <span className="text-[11px] text-stone-400">Values are stored locally in your browser</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Auto.dev API Key:</label>
                <input
                  type="password"
                  placeholder="Paste Auto.dev Key"
                  value={apiKeys.AUTODEV || ''}
                  onChange={(e) => handleKeyChange('AUTODEV', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">CarImages API Key:</label>
                <input
                  type="password"
                  placeholder="Paste CarImages Key"
                  value={apiKeys.CARIMAGES || ''}
                  onChange={(e) => handleKeyChange('CARIMAGES', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Custom / CarAPIs Endpoint & Key:</label>
                <input
                  type="text"
                  placeholder="https://api.carapis.com/apix/catalog_api/vehicles"
                  value={customBaseUrl}
                  onChange={(e) => handleCustomUrlChange(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none mb-1"
                />
                <input
                  type="password"
                  placeholder="Bearer Token / API Key"
                  value={apiKeys.CUSTOM || ''}
                  onChange={(e) => handleKeyChange('CUSTOM', e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={fetchVehicles}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                Apply Keys & Re-fetch Gallery
              </button>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => {
                setCategory('all');
                setSelectedBrand('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                category === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setCategory('CAR');
                setSelectedBrand('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                category === 'CAR' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              🚗 Cars
            </button>
            <button
              onClick={() => {
                setCategory('BIKE');
                setSelectedBrand('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                category === 'BIKE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              🏍 Bikes
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Brand:</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="all">All Brands</option>
              {filteredBrands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Body Type:</label>
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="all">All Body Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Compact SUV">Compact SUV</option>
              <option value="Cruiser">Cruiser (Bike)</option>
              <option value="Sports">Sports (Bike)</option>
              <option value="Commuter">Commuter (Bike)</option>
              <option value="Scooter">Scooter</option>
            </select>
          </div>

          <div className="ml-auto text-xs font-bold text-stone-500">
            {loading ? 'Refreshing gallery...' : `${vehicles.length} vehicles found`}
          </div>
        </div>

        {/* Gallery Cards */}
        {loading ? (
          <div className="py-20 text-center text-stone-400 font-medium">
            Fetching photos from {source}...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="py-20 bg-white rounded-3xl border border-stone-200 text-center text-stone-500">
            No cars or bikes match your current filter settings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((car) => {
              const isCurrent = car.currentHeroImage === car.displayImage;
              const hasApiImage = car.sourceStatus.startsWith('Live from');

              return (
                <div
                  key={car.id}
                  className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg">
                          {car.brandName}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                            car.category === 'BIKE'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {car.category}
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-500 rounded-lg">
                        {car.bodyType}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-stone-900">{car.name}</h2>
                    
                    {/* Diagnostic Status Box */}
                    <div className="mt-1.5 p-2 bg-stone-50 rounded-xl border border-stone-100">
                      <span className={`text-[11px] font-mono block ${hasApiImage ? 'text-emerald-700 font-bold' : 'text-stone-500'}`}>
                        {car.sourceStatus}
                      </span>
                    </div>

                    <div className="relative mt-4 h-48 bg-stone-50 rounded-2xl flex items-center justify-center p-3 border border-stone-100 overflow-hidden">
                      <img
                        src={car.displayImage}
                        alt={car.name}
                        className="max-h-full max-w-full object-contain drop-shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/vehicles/placeholder.svg';
                        }}
                      />
                      {isCurrent && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-xs">
                          Active on Live Site
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-stone-100 mt-2">
                    <button
                      onClick={() => handleApplyImage(car)}
                      disabled={isCurrent || updatingId === car.id}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-stone-900 hover:bg-black text-white shadow-xs'
                      }`}
                    >
                      {updatingId === car.id ? 'Saving...' : isCurrent ? 'Active Photo' : 'Set as Website Pic'}
                    </button>

                    <button
                      onClick={() => setUploadModalVehicle(car)}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    >
                      Upload Custom File
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload Modal */}
        {uploadModalVehicle && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <h3 className="text-xl font-black text-stone-900">Upload Picture</h3>
              <p className="text-stone-500 text-xs mt-1">
                Upload a verified local image for <span className="font-bold text-stone-800">{uploadModalVehicle.name}</span>.
              </p>

              <form onSubmit={handleUploadSubmit} className="mt-6 space-y-4">
                <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-stone-400 transition-colors">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-black cursor-pointer"
                  />
                  <p className="text-[11px] text-stone-400 mt-2">Accepts PNG, JPG, or WEBP.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadModalVehicle(null);
                      setUploadFile(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-xl shadow-xs transition-colors"
                  >
                    {uploading ? 'Uploading...' : 'Save & Publish'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}