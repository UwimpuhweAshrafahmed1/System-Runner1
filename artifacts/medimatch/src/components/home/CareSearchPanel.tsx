import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { ArrowRight, ChevronDown, Languages, MapPin, Search } from "lucide-react";
import {
  bookingHref,
  carePreferenceMaxLength,
  careTreatments,
  type CareTreatmentSlug,
} from "@/lib/treatments";
import { scrollToPageTop } from "./HomeLink";

/**
 * There is no live provider search, so this panel starts a consultation
 * request: the booking page opens with these choices filled in and a care
 * coordinator confirms what is available.
 */
export function CareSearchPanel() {
  const [, setLocation] = useLocation();
  const [treatment, setTreatment] = useState<CareTreatmentSlug | "">("");
  const [destination, setDestination] = useState("");
  const [language, setLanguage] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocation(bookingHref({ treatment: treatment || undefined, destination, language }));
    scrollToPageTop();
  };

  return (
    <form className="mmh-search" onSubmit={submit} aria-labelledby="mmh-search-title">
      <h2 id="mmh-search-title" className="mmh-visually-hidden">
        Start a care request
      </h2>
      <div className="mmh-search__fields">
        <div className="mmh-search__field">
          <span className="mmh-search__icon mmh-tint-orange" aria-hidden="true">
            <Search size={20} />
          </span>
          <div className="mmh-search__control">
            <label htmlFor="mmh-search-treatment">Treatment or specialty</label>
            <div className="mmh-search__select">
              <select
                id="mmh-search-treatment"
                className={treatment ? undefined : "is-empty"}
                value={treatment}
                onChange={(event) => setTreatment(event.target.value as CareTreatmentSlug | "")}
              >
                <option value="">Choose a treatment</option>
                {careTreatments.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="mmh-search__field">
          <span className="mmh-search__icon mmh-tint-green" aria-hidden="true">
            <MapPin size={20} />
          </span>
          <div className="mmh-search__control">
            <label htmlFor="mmh-search-destination">Destination</label>
            <input
              id="mmh-search-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              maxLength={carePreferenceMaxLength}
              placeholder="Country or city, e.g. Türkiye"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="mmh-search__field">
          <span className="mmh-search__icon mmh-tint-blue" aria-hidden="true">
            <Languages size={20} />
          </span>
          <div className="mmh-search__control">
            <label htmlFor="mmh-search-language">Preferred language</label>
            <input
              id="mmh-search-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              maxLength={carePreferenceMaxLength}
              placeholder="e.g. English"
              autoComplete="language"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="mmh-btn mmh-btn--orange mmh-search__submit">
        Find care <ArrowRight size={18} aria-hidden="true" />
      </button>

      <p className="mmh-search__note">
        Find care opens a consultation request with your choices filled in. A care coordinator
        confirms what is available.
      </p>
    </form>
  );
}
