import { useEffect, useMemo, useRef, useState } from 'react'
import { mapApi } from '../services/api.js'

const DEFAULT_MAP_CENTER = {
  lat: 35.6892,
  lng: 51.389,
}

const NESHAN_SDK_CSS_ID = 'neshan-leaflet-sdk-css'
const NESHAN_SDK_SCRIPT_ID = 'neshan-leaflet-sdk-script'
const NESHAN_SDK_CSS_URL = 'https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.css'
const NESHAN_SDK_SCRIPT_URL = 'https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.js'

let neshanSdkPromise = null

const toNumber = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

const hasValue = (value) => value !== '' && value !== undefined && value !== null

const loadNeshanSdk = () => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not available'))
  }

  if (window.L?.Map) {
    return Promise.resolve(window.L)
  }

  if (!document.getElementById(NESHAN_SDK_CSS_ID)) {
    const link = document.createElement('link')
    link.id = NESHAN_SDK_CSS_ID
    link.rel = 'stylesheet'
    link.href = NESHAN_SDK_CSS_URL
    document.head.appendChild(link)
  }

  if (!neshanSdkPromise) {
    neshanSdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById(NESHAN_SDK_SCRIPT_ID)

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(window.L), { once: true })
        existingScript.addEventListener('error', () => reject(new Error('Neshan SDK could not be loaded')), { once: true })
        return
      }

      const script = document.createElement('script')
      script.id = NESHAN_SDK_SCRIPT_ID
      script.src = NESHAN_SDK_SCRIPT_URL
      script.async = true
      script.onload = () => resolve(window.L)
      script.onerror = () => reject(new Error('Neshan SDK could not be loaded'))
      document.body.appendChild(script)
    })
  }

  return neshanSdkPromise
}

const buildDisplayAddress = (item) => {
  const title = item.title || ''
  const address = item.address || ''

  if (title && address && !address.includes(title)) {
    return `${title}، ${address}`
  }

  return address || title || 'موقعیت انتخابی'
}

function LocationPicker({ title, description, lat, lng, address, latName, lngName, addressName, onChange, required = false }) {
  const [searchQuery, setSearchQuery] = useState(address || '')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [mapError, setMapError] = useState('')

  const mapElementRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const addressNameRef = useRef(addressName)

  const mapApiKey = import.meta.env.VITE_NESHAN_WEB_API_KEY || ''
  const mapType = import.meta.env.VITE_NESHAN_MAP_TYPE || 'dreamy'

  const hasSelectedLocation = hasValue(lat) && hasValue(lng)
  const selectedLocation = useMemo(
    () => ({
      lat: toNumber(lat, DEFAULT_MAP_CENTER.lat),
      lng: toNumber(lng, DEFAULT_MAP_CENTER.lng),
    }),
    [lat, lng],
  )

  useEffect(() => {
    onChangeRef.current = onChange
    addressNameRef.current = addressName
  }, [onChange, addressName])

  useEffect(() => {
    if (address !== undefined) {
      queueMicrotask(() => setSearchQuery(address || ''))
    }
  }, [address])

  const updateLocation = (nextLat, nextLng, nextAddress) => {
    const safeLat = toNumber(nextLat, DEFAULT_MAP_CENTER.lat)
    const safeLng = toNumber(nextLng, DEFAULT_MAP_CENTER.lng)
    const updates = {
      [latName]: String(safeLat.toFixed(6)),
      [lngName]: String(safeLng.toFixed(6)),
      ...(addressNameRef.current ? { [addressNameRef.current]: nextAddress || '' } : {}),
    }

    onChangeRef.current(updates)

    if (nextAddress) {
      setSearchQuery(nextAddress)
    }

    setError('')
    setResults([])
  }

  const getAddressFromCoordinates = async (nextLat, nextLng, fallbackAddress = 'موقعیت انتخاب‌شده روی نقشه') => {
    try {
      const result = await mapApi.reverse({ lat: nextLat, lng: nextLng })
      return result.data.formattedAddress || fallbackAddress
    } catch {
      return fallbackAddress
    }
  }

  const selectCoordinates = async (nextLat, nextLng, fallbackAddress) => {
    setIsSearching(true)
    setError('')

    try {
      const nextAddress = await getAddressFromCoordinates(nextLat, nextLng, fallbackAddress)
      updateLocation(nextLat, nextLng, nextAddress)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    if (!mapApiKey) {
      return undefined
    }

    const setupMap = async () => {
      try {
        const L = await loadNeshanSdk()

        if (!isMounted || !mapElementRef.current || mapInstanceRef.current) {
          return
        }

        const center = [selectedLocation.lat, selectedLocation.lng]
        const neshanMap = new L.Map(mapElementRef.current, {
          key: mapApiKey,
          maptype: mapType,
          poi: true,
          traffic: false,
          center,
          zoom: hasSelectedLocation ? 15 : 12,
        })

        mapInstanceRef.current = neshanMap

        if (hasSelectedLocation) {
          markerRef.current = L.marker(center).addTo(neshanMap)
        }

        neshanMap.on('click', (event) => {
          const nextLat = event.latlng.lat
          const nextLng = event.latlng.lng

          if (!markerRef.current) {
            markerRef.current = L.marker([nextLat, nextLng]).addTo(neshanMap)
          } else {
            markerRef.current.setLatLng([nextLat, nextLng])
          }

          selectCoordinates(nextLat, nextLng, 'موقعیت انتخاب‌شده روی نقشه')
        })

        setMapError('')
      } catch {
        if (isMounted) {
          setMapError('نقشه نشان بارگذاری نشد. اتصال اینترنت یا کلید نقشه را بررسی کنید.')
        }
      }
    }

    setupMap()

    return () => {
      isMounted = false

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
    // The map should be created once. Later coordinate changes are handled in the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapApiKey, mapType])

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = window.L

    if (!map || !L || !hasSelectedLocation) {
      return
    }

    const center = [selectedLocation.lat, selectedLocation.lng]

    if (!markerRef.current) {
      markerRef.current = L.marker(center).addTo(map)
    } else {
      markerRef.current.setLatLng(center)
    }

    map.setView(center, Math.max(map.getZoom(), 15))
  }, [hasSelectedLocation, selectedLocation])

  const handleAddressChange = (event) => {
    if (!addressName) {
      return
    }

    const { value } = event.target
    onChange({ [addressName]: value })
  }

  const handleSearch = async (event) => {
    event.preventDefault()

    const term = searchQuery.trim()

    if (!term) {
      setError('برای جستجو، نام خیابان، محله یا شهر را وارد کنید.')
      setResults([])
      return
    }

    setIsSearching(true)
    setError('')

    try {
      const result = await mapApi.search({
        term,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
      })
      const items = result.data.items || []
      setResults(items)

      if (items.length === 0) {
        setError('موقعیتی با این عبارت پیدا نشد. عبارت دقیق‌تری وارد کنید.')
      }
    } catch (searchError) {
      setError(searchError.message || 'امکان جستجوی موقعیت در حال حاضر وجود ندارد. اتصال بک‌اند یا کلید نشان را بررسی کنید.')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleResultClick = (item) => {
    const nextAddress = buildDisplayAddress(item)
    updateLocation(item.lat, item.lng, nextAddress)
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('مرورگر شما دریافت موقعیت فعلی را پشتیبانی نمی‌کند.')
      return
    }

    setIsSearching(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLat = position.coords.latitude
        const nextLng = position.coords.longitude
        const nextAddress = await getAddressFromCoordinates(nextLat, nextLng, 'موقعیت فعلی من')
        updateLocation(nextLat, nextLng, nextAddress)
        setIsSearching(false)
      },
      () => {
        setError('دسترسی به موقعیت فعلی داده نشد یا امکان دریافت آن وجود ندارد.')
        setIsSearching(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <section className="md:col-span-2 rounded-[22px] border border-[#e8f1f6] bg-gradient-to-br from-white to-[#fbfdff] p-4 shadow-[0_14px_36px_rgba(23,32,51,0.045)]">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <h3 className="text-[15px] font-bold text-[#172033]">
            {title} {required && <span className="text-[#d94d4d]">*</span>}
          </h3>
          {description && <p className="mt-2 text-[12px] leading-6 text-[#7b8796]">{description}</p>}
        </div>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="مثلاً تهران، سعادت‌آباد، میدان کاج"
          className="h-12 flex-1 rounded-[14px] border border-[#dfe8ef] bg-white px-4 text-[13px] text-[#172033] outline-none transition placeholder:text-[#a9b6c6] focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="h-12 rounded-[14px] bg-[#8dc9c0] px-6 text-[13px] font-bold text-white shadow-[0_10px_22px_rgba(141,201,192,0.25)] transition hover:-translate-y-0.5 hover:bg-[#78bdb3] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSearching ? 'در حال جستجو...' : 'جستجو با نشان'}
        </button>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isSearching}
          className="h-12 rounded-[14px] border border-[#dfe8ef] bg-white px-5 text-[13px] font-bold text-[#55b7ad] transition hover:-translate-y-0.5 hover:border-[#9fd7cf] hover:bg-[#eef9f7] disabled:cursor-not-allowed disabled:opacity-60"
        >
          موقعیت فعلی
        </button>
      </form>

      {error && <p className="mt-3 rounded-[12px] bg-[#fff4f4] px-4 py-3 text-[12px] font-semibold text-[#d94d4d]">{error}</p>}
      {(mapError || !mapApiKey) && (
        <p className="mt-3 rounded-[12px] bg-[#fff8e8] px-4 py-3 text-[12px] font-semibold text-[#9a6a00]">
          {mapError || 'برای نمایش نقشه نشان، مقدار VITE_NESHAN_WEB_API_KEY را در فایل .env فرانت‌اند قرار دهید.'}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-[16px] border border-[#eaf1f7] bg-white">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleResultClick(item)}
              className="block w-full border-b border-[#edf3f8] px-4 py-3 text-right text-[12px] leading-6 text-[#536174] transition last:border-b-0 hover:bg-[#f6fbfd] hover:text-[#172033]"
            >
              <span className="block font-bold text-[#172033]">{item.title}</span>
              <span className="mt-1 block">{item.address}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-[18px] border border-[#eaf1f7] bg-[#eef4f8] shadow-inner">
        <div ref={mapElementRef} className="h-[280px] w-full" />
      </div>

      {addressName && (
        <label className="mt-4 block text-[13px] font-semibold text-[#536174]">
          آدرس انتخاب‌شده
          <textarea
            name={addressName}
            value={address || ''}
            onChange={handleAddressChange}
            placeholder="بعد از انتخاب از نتایج نقشه، می‌توانید جزئیات آدرس را کامل‌تر کنید."
            rows="3"
            className="mt-2 w-full resize-none rounded-[14px] border border-[#dfe8ef] bg-white px-4 py-3 text-[13px] leading-7 text-[#172033] outline-none transition placeholder:text-[#a9b6c6] focus:border-[#9fd7cf] focus:ring-4 focus:ring-[#9fd7cf]/20"
          />
        </label>
      )}
    </section>
  )
}

export default LocationPicker
