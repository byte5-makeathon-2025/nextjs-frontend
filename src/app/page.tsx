'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Snowfall from 'react-snowfall';

export default function Home() {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [snowflakeImages, setSnowflakeImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const giftImage = document.createElement('img');
    giftImage.src = 'https://www.pngall.com/wp-content/uploads/2016/07/Birthday-Present-PNG.png';

    const handleLoad = () => setSnowflakeImages([giftImage]);
    const handleError = () => setSnowflakeImages([]);

    giftImage.addEventListener('load', handleLoad);
    giftImage.addEventListener('error', handleError);

    return () => {
      giftImage.removeEventListener('load', handleLoad);
      giftImage.removeEventListener('error', handleError);
    };
  }, []);

  const getCoordinates = async (): Promise<{ latitude: string | number | null; longitude: string | number | null }> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('Geolocation not supported');
      setLocationError('Location sharing is not supported in this browser.');
      return { latitude: null, longitude: null };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setLocationError('We could not access your location. Your wish will still be submitted.');
          resolve({ latitude: null, longitude: null });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocationError(null);

    try {
      const coords = await getCoordinates();
      await api.wishes.create({ name, title, description, priority, ...coords });
      setSubmitted(true);
      setName('');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setTimeout(() => setSubmitted(false), 10000);
    } catch (error) {
      console.error('Failed to submit wish:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
      {submitted ? <Snowfall
        radius={[30.0, 50.0]}
        images={snowflakeImages}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      /> : null
      }
      <Snowfall
        radius={[3.0, 5.0]}
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
        }}
      />

      <Link
        href="/login"
        className="absolute top-4 right-4 text-xs text-slate-400 hover:text-slate-600 transition-colors underline"
      >
        staff
      </Link>

      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 bg-white shadow-xl min-h-[600px]">
          {/* Left side - decorative card cover */}
          {/* <div */}
          {/*   className="bg-gradient-to-br from-slate-50 to-slate-100 p-12 flex items-center justify-center border-r border-slate-200 relative" */}
          {/* > */}
          {/*   <div className="absolute inset-0 bg-white/40"></div> */}
          {/*   <div className="text-center relative z-10"> */}
          {/*     <div className="text-6xl mb-4">✦</div> */}
          {/*     <h1 className="text-2xl text-slate-700 font-light"> */}
          {/*       My Wish */}
          {/*     </h1> */}
          {/*   </div> */}
          {/* </div> */}
          {/**/}
          {/* Right side - form content */}
          <div className="p-12 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl text-slate-900 mb-2 font-light">
                  Thank you!
                </h2>
                <p className="text-slate-600 text-7xl">
                  Santa is coming!                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm text-slate-600 mb-2">
                    Your name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm text-slate-600 mb-2">
                    I wish for
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent focus:border-slate-400 outline-none transition text-slate-900 text-lg"
                    placeholder="..."
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm text-slate-600 mb-2">
                    Details
                  </label>
                  <textarea
                    id="description"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="w-full px-0 py-2 border-0 border-b border-slate-200 bg-transparent outline-none resize-none text-slate-900"
                    placeholder="Write your wish..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-600 mb-3">
                    Priority
                  </label>
                  <div className="flex gap-4">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priority"
                          value={p}
                          checked={priority === p}
                          onChange={() => setPriority(p)}
                          className="w-4 h-4"
                        />
                        <span className="text-slate-700 capitalize text-sm">
                          {p}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    fullWidth
                    variant="primary"
                    className="py-3"
                  >
                    {loading ? 'Sending...' : 'Submit Wish'}
                  </Button>
                </div>
              </form>
            )}
            {locationError && (
              <p className="text-xs text-amber-600 mt-4">
                {locationError}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
