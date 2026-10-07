'use client';

import React, { useState } from 'react';

const PRESET_APIS = [
  {
    name: 'CarImagesAPI (Direct Image CDN)',
    endpoint: 'https://carimagesapi.com/api/v1/cars',
    authType: 'query',
    keyParam: 'api_key',
    defaultKey: 'ci_98cee377cdd0b4da8ed2513d4d31c6354aec589c0a337653fd49c120',
    defaultParams: { make: 'honda', model: 'city' },
  },
  {
    name: 'Auto.dev (Listings & Live Photos)',
    endpoint: 'https://auto.dev/api/listings',
    authType: 'bearer',
    keyParam: '',
    defaultKey: '',
    defaultParams: { make: 'Hyundai', model: 'Tucson', limit: '1' },
  },
  {
    name: 'CarAPIs (Specs Catalog)',
    endpoint: 'https://api.carapis.com/apix/catalog_api/vehicles',
    authType: 'bearer',
    keyParam: '',
    defaultKey: '',
    defaultParams: { make: 'Honda', model: 'Civic', limit: '1' },
  },
  {
    name: 'API-Ninjas Cars (Specs Database)',
    endpoint: 'https://api.api-ninjas.com/v1/cars',
    authType: 'header',
    keyParam: 'X-Api-Key',
    defaultKey: '',
    defaultParams: { make: 'Toyota', model: 'Camry', limit: '1' },
  },
];

export default function ApiTesterPage() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_APIS[0]);
  const [endpoint, setEndpoint] = useState(PRESET_APIS[0].endpoint);
  const [apiKey, setApiKey] = useState(PRESET_APIS[0].defaultKey);
  const [authType, setAuthType] = useState(PRESET_APIS[0].authType);
  const [headerName, setHeaderName] = useState('X-Api-Key');
  const [make, setMake] = useState('honda');
  const [model, setModel] = useState('city');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const applyPreset = (preset: typeof PRESET_APIS[0]) => {
    setSelectedPreset(preset);
    setEndpoint(preset.endpoint);
    setApiKey(preset.defaultKey);
    setAuthType(preset.authType);
    if (preset.authType === 'header') setHeaderName(preset.keyParam);
    if (preset.defaultParams.make) setMake(preset.defaultParams.make);
    if (preset.defaultParams.model) setModel(preset.defaultParams.model);
  };

  const handleTestApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const headers: Record<string, string> = {};
    const params: Record<string, string> = { make, model };

    if (authType === 'bearer' && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey.trim()}`;
    } else if (authType === 'header' && apiKey) {
      headers[headerName.trim()] = apiKey.trim();
    } else if (authType === 'query' && apiKey) {
      params['api_key'] = apiKey.trim();
    }

    try {
      const res = await fetch('/api/admin/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          method: 'GET',
          headers,
          params,
        }),
      });

      const json = await res.json();
      setResult(json);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6 md:p-10 font-sans text-stone-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-stone-900">Automotive API Inspector</h1>
            <p className="text-stone-500 text-xs mt-1">
              Verify real data payloads (Images, Specs, Pricing) from any automotive provider before integrating.
            </p>
          </div>
          <a
            href="/admin/media-studio"
            className="text-xs font-bold px-4 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-stone-700 transition"
          >
            ← Back to Media Studio
          </a>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-2">
          {PRESET_APIS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPreset.name === preset.name
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Test Form */}
        <form onSubmit={handleTestApi} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">API Endpoint URL</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">Auth Type & API Key</label>
              <div className="flex gap-2">
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-bold"
                >
                  <option value="bearer">Bearer Token</option>
                  <option value="header">Custom Header</option>
                  <option value="query">URL Query Param</option>
                  <option value="none">None</option>
                </select>
                <input
                  type="text"
                  placeholder="Paste API Key / Secret"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">Make / Brand</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-bold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-500 block mb-1">Model Name</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-2 text-xs font-bold"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white text-xs font-black rounded-xl shadow-xs transition"
              >
                {loading ? 'Calling API...' : '🚀 Send Request & Inspect'}
              </button>
            </div>
          </div>
        </form>

        {/* Results Panel */}
        {result && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    result.status === 200
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  HTTP {result.status || 'ERR'}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  Latency: {result.latencyMs}ms
                </span>
              </div>
              <span className="text-[11px] font-mono text-stone-400 break-all max-w-lg">
                {result.urlCalled}
              </span>
            </div>

            {/* Check for image previews inside payload */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Extracted Images in Response
              </h3>
              <div className="p-4 bg-stone-50 rounded-2xl flex flex-wrap gap-4 items-center min-h-[90px]">
                {JSON.stringify(result.data).match(/https?:\/\/[^"'\s]+?\.(?:png|jpg|jpeg|webp)/gi)?.map(
                  (imgUrl, idx) => (
                    <div key={idx} className="relative group border border-stone-200 bg-white p-2 rounded-xl">
                      <img src={imgUrl} alt="Payload preview" className="h-16 w-auto object-contain" />
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-blue-600 block text-center mt-1 underline"
                      >
                        Open
                      </a>
                    </div>
                  )
                ) || (
                  <span className="text-xs text-stone-400">
                    No image URLs found in this API response payload.
                  </span>
                )}
              </div>
            </div>

            {/* Raw JSON Inspector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Raw JSON Payload
              </h3>
              <pre className="p-4 bg-stone-900 text-stone-100 rounded-2xl text-[11px] font-mono overflow-auto max-h-96">
                {JSON.stringify(result.data || result, null, 2)}
              </pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}