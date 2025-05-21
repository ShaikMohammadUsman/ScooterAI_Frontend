import { useState } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

interface PickerProps {
    // updateDate: React.Dispatch<React.SetStateAction<string>>;
    updateDate: (date: string) => void;
    disabled: boolean;
}
const DateTimePicker: React.FC<PickerProps> = ({ updateDate, disabled }) => {
    const [date, setDate] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const handleDateChange = (newDate: Date) => {
        setDate(newDate);
    };

    const handleButtonClick = () => {
        const updatedDate = date.toISOString();
        updateDate(updatedDate);
        // console.log(isoString);
    };

    const minDate = new Date();

    return (
        <div className="flex items-center justify-center gap-4 p-4">
            <div className="flex items-center justify-center gap-2">
                <Input
                    type="date"
                    min={minDate.toISOString().split('T')[0]}
                    value={date.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    className="rounded-lg border border-gray-300 p-2"
                />
                {/* <button
          onClick={() => setShowTime(!showTime)}
          className="rounded-lg border border-gray-300 p-2"
        >
          <Clock className="w-5 h-5" />
        </button> */}
            </div>
            {/* {showTime && ( */}
            <Input
                type="time"
                value={date.toLocaleTimeString('en-GB', { hour12: false })}
                onChange={(e) => {
                    const newDate = new Date(date);
                    const [hours, minutes] = e.target.value.split(':');
                    newDate.setHours(Number(hours));
                    newDate.setMinutes(Number(minutes));
                    handleDateChange(newDate);
                }}
                className="rounded-lg border border-gray-300 p-2"
            />
            {/* )} */}
            <Button
                onClick={handleButtonClick}
                // className="rounded-lg bg-primary text-primary-foreground p-2"
                disabled={disabled}
            >
                Submit {disabled && (<Loader2 className='animate-spin border-secondary h-4 w-4 ml-1 rounded-full' />)}
            </Button>
        </div>
    );
};

export default DateTimePicker;