import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchLeads } from '../../lib/api/search.api';
import type { Lead } from '@shared/index';
import { Badge } from '../ui/Badge';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Lead[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchLeads(debouncedQuery).then(res => {
        setResults(res.data);
        setShowResults(true);
      });
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(lead: Lead) {
    setQuery('');
    setShowResults(false);
    navigate(`/leads/${lead.id}`);
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div ref={searchRef} className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowResults(true); }}
          className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg max-h-80 overflow-y-auto">
            {results.map(lead => (
              <button
                key={lead.id}
                onClick={() => handleSelect(lead)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                </div>
                <Badge variant="status" value={lead.status}>{lead.status}</Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
