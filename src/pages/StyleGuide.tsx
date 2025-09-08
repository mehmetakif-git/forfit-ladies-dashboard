import React, { useState } from 'react';
import { ChevronDown, Settings, User, Calendar, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Combobox, ComboboxOption } from '../components/ui/combobox';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import Button from '../components/UI/Button';
import Breadcrumb from '../components/UI/Breadcrumb';

const StyleGuide: React.FC = () => {
  const [selectValue, setSelectValue] = useState<string>('');
  const [comboboxValue, setComboboxValue] = useState<string>('');
  const [isRTL, setIsRTL] = useState(false);

  const shortOptions = [
    'Option 1',
    'Option 2', 
    'Option 3'
  ];

  const longOptions = [
    'This is a very long option that should test text wrapping and overflow behavior',
    'Another extremely long option with lots of text to see how it handles',
    'Short',
    'Medium length option',
    'Yet another very long option that goes on and on with more text than usual'
  ];

  const scrollingOptions = Array.from({ length: 20 }, (_, i) => `Scrolling Option ${i + 1}`);

  const comboboxOptions: ComboboxOption[] = [
    { value: 'option1', label: 'First Option' },
    { value: 'option2', label: 'Second Option' },
    { value: 'option3', label: 'Third Option', disabled: true },
    { value: 'option4', label: 'Very Long Option That Tests Text Wrapping' },
    { value: 'option5', label: 'Another Option' },
  ];

  const toggleRTL = () => {
    setIsRTL(!isRTL);
    document.documentElement.dir = isRTL ? 'ltr' : 'rtl';
  };

  return (
    <div className="p-6 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <Breadcrumb items={[{ label: 'Style Guide' }, { label: 'Menu Components' }]} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Menu Components Style Guide</h1>
          <p className="text-white/70">Visual QA for dropdown components</p>
        </div>
        <Button onClick={toggleRTL} variant="outline">
          Toggle RTL ({isRTL ? 'RTL' : 'LTR'})
        </Button>
      </div>

      {/* Select Components */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Select Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Short Options */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Short Options</label>
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {shortOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Long Options */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Long Options</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a long option" />
              </SelectTrigger>
              <SelectContent>
                {longOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scrolling Options */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Scrolling Options</label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select from many options" />
              </SelectTrigger>
              <SelectContent>
                {scrollingOptions.map((option, index) => (
                  <SelectItem key={index} value={option} disabled={index === 5}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Small Width */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Small Width</label>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Small" />
              </SelectTrigger>
              <SelectContent>
                {shortOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Large Width */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Large Width</label>
            <Select>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="This is a very wide select trigger" />
              </SelectTrigger>
              <SelectContent>
                {longOptions.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Disabled */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Disabled</label>
            <Select disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Disabled select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dropdown Menu Components */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Dropdown Menu Components</h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Basic Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" icon={Settings}>
                Basic Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Long Items Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Long Items Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Long Options</DropdownMenuLabel>
              {longOptions.slice(0, 4).map((option, index) => (
                <DropdownMenuItem key={index}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Scrolling Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Scrolling Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Many Options</DropdownMenuLabel>
              {scrollingOptions.slice(0, 15).map((option, index) => (
                <DropdownMenuItem key={index} disabled={index === 7}>
                  {option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Combobox Components */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Combobox Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Combobox */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Basic Combobox</label>
            <Combobox
              options={comboboxOptions}
              value={comboboxValue}
              onValueChange={setComboboxValue}
              placeholder="Select option..."
            />
          </div>

          {/* Small Width Combobox */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Small Width</label>
            <Combobox
              options={comboboxOptions}
              placeholder="Small"
              className="w-32"
            />
          </div>

          {/* Large Width Combobox */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Large Width</label>
            <Combobox
              options={comboboxOptions}
              placeholder="This is a very wide combobox trigger"
              className="w-80"
            />
          </div>

          {/* Disabled Combobox */}
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-medium">Disabled</label>
            <Combobox
              options={comboboxOptions}
              placeholder="Disabled combobox"
              disabled
            />
          </div>
        </div>
      </div>

      {/* Popover Components */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Popover Components</h2>
        
        <div className="flex flex-wrap gap-4">
          {/* Basic Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                Basic Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Popover Content</h4>
                <p className="text-sm text-white/70">
                  This is a basic popover with some content inside.
                </p>
                <div className="flex gap-2">
                  <Button size="sm">Action</Button>
                  <Button size="sm" variant="outline">Cancel</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Wide Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64">
                Wide Trigger Popover
              </Button>
            </PopoverTrigger>
            <PopoverContent matchTriggerWidth>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Wide Popover</h4>
                <p className="text-sm text-white/70">
                  This popover matches the width of its trigger button.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {/* Small Trigger Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                Small
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <h4 className="font-medium text-white">Small Trigger</h4>
                <p className="text-sm text-white/70">
                  This popover has a small trigger but normal content width.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Accessibility & Keyboard Navigation */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Accessibility & Keyboard Navigation</h2>
        
        <div className="space-y-4 text-white/80">
          <div>
            <h3 className="font-medium text-white mb-2">Keyboard Shortcuts:</h3>
            <ul className="space-y-1 text-sm">
              <li><kbd className="px-2 py-1 bg-white/10 rounded text-xs">Space/Enter</kbd> - Open dropdown</li>
              <li><kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑/↓</kbd> - Navigate options</li>
              <li><kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> - Select option</li>
              <li><kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd> - Close dropdown</li>
              <li><kbd className="px-2 py-1 bg-white/10 rounded text-xs">Type</kbd> - Search/filter options</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-2">Focus Management:</h3>
            <ul className="space-y-1 text-sm">
              <li>• Focus ring visible with brand colors</li>
              <li>• WCAG AA contrast compliance</li>
              <li>• Proper focus trapping in modals</li>
              <li>• Screen reader announcements</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Theme Tokens */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Theme Tokens</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-white mb-3">CSS Variables</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-surface rounded"></div>
                <span className="text-white/70">--surface-bg</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 card-surface rounded"></div>
                <span className="text-white/70">--surface-card</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[color:var(--border)] rounded"></div>
                <span className="text-white/70">--border</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[color:var(--brand-1)] rounded"></div>
                <span className="text-white/70">--brand-1</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-white mb-3">Utility Classes</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-surface rounded-lg">
                <code>.bg-surface</code>
              </div>
              <div className="p-2 card-surface rounded-lg">
                <code>.card-surface</code>
              </div>
              <div className="p-2 brand-gradient-bg rounded-lg text-dark">
                <code>.brand-gradient-bg</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuide;