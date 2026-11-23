use crate::models::{RestorationPriority, Severity};

pub fn severity(dnbr: f64) -> Severity {
    if dnbr < 0.10 {
        Severity::Unburned
    } else if dnbr <= 0.26 {
        Severity::Low
    } else if dnbr <= 0.43 {
        Severity::ModerateLow
    } else if dnbr <= 0.65 {
        Severity::ModerateHigh
    } else {
        Severity::High
    }
}

pub fn priority(dnbr: f64) -> RestorationPriority {
    if dnbr >= 0.44 {
        RestorationPriority::Priority1
    } else if dnbr >= 0.27 {
        RestorationPriority::Priority2
    } else {
        RestorationPriority::Priority3
    }
}
