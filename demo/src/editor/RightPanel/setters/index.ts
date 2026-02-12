// 基础Setter (12种)
export { default as StringSetter } from './StringSetter';
export { default as NumberSetter } from './NumberSetter';
export { default as BooleanSetter } from './BooleanSetter';
export { default as SelectSetter } from './SelectSetter';
export { default as ColorSetter } from './ColorSetter';
export { default as DateSetter } from './DateSetter';
export { default as TimeSetter } from './TimeSetter';
export { default as TextAreaSetter } from './TextAreaSetter';
export { default as SliderSetter } from './SliderSetter';
export { default as RateSetter } from './RateSetter';
export { default as SwitchSetter } from './SwitchSetter';
export { default as ClassNameSetter } from './ClassNameSetter';

// 复杂类型Setter (5种)
export { default as ArraySetter } from './ArraySetter';
export { default as JSONSetter } from './JSONSetter';
export { default as FunctionSetter } from './FunctionSetter';
export { default as ExpressionSetter } from './ExpressionSetter';
export { default as EventSetter } from './EventSetter';

// 资源类型Setter (2种)
export { default as ImageSetter } from './ImageSetter';
export { default as IconSetter } from './IconSetter';

// 高级Setter (2种)
export { default as StyleSetter } from './StyleSetter';
export { default as MixedSetter } from './MixedSetter';

// 动态渲染Setter (2种)
export { default as ConditionSetter } from './ConditionSetter';
export { default as LoopSetter } from './LoopSetter';

// 高级功能Setter (4种)
export { default as VariableBindingSetter } from './VariableBindingSetter';
export { default as LinkageSetter } from './LinkageSetter';
export { default as I18nSetter } from './I18nSetter';
export { default as SlotSetter } from './SlotSetter';

// 导入所有Setter用于映射
import StringSetter from './StringSetter';
import NumberSetter from './NumberSetter';
import BooleanSetter from './BooleanSetter';
import SelectSetter from './SelectSetter';
import ColorSetter from './ColorSetter';
import DateSetter from './DateSetter';
import TimeSetter from './TimeSetter';
import TextAreaSetter from './TextAreaSetter';
import SliderSetter from './SliderSetter';
import RateSetter from './RateSetter';
import SwitchSetter from './SwitchSetter';
import ClassNameSetter from './ClassNameSetter';
import ArraySetter from './ArraySetter';
import JSONSetter from './JSONSetter';
import FunctionSetter from './FunctionSetter';
import ExpressionSetter from './ExpressionSetter';
import EventSetter from './EventSetter';
import ImageSetter from './ImageSetter';
import IconSetter from './IconSetter';
import StyleSetter from './StyleSetter';
import MixedSetter from './MixedSetter';
import ConditionSetter from './ConditionSetter';
import LoopSetter from './LoopSetter';
import VariableBindingSetter from './VariableBindingSetter';
import LinkageSetter from './LinkageSetter';
import I18nSetter from './I18nSetter';
import SlotSetter from './SlotSetter';

// Setter映射表
export const SetterMap = {
    StringSetter,
    NumberSetter,
    BooleanSetter,
    SelectSetter,
    ColorSetter,
    DateSetter,
    TimeSetter,
    TextAreaSetter,
    SliderSetter,
    RateSetter,
    SwitchSetter,
    ClassNameSetter,
    ArraySetter,
    JSONSetter,
    FunctionSetter,
    EventSetter,
    ExpressionSetter,
    ImageSetter,
    IconSetter,
    StyleSetter,
    MixedSetter,
    ConditionSetter,
    LoopSetter,
    VariableBindingSetter,
    LinkageSetter,
    I18nSetter,
    SlotSetter,
};
