// Original prototype passage and editorial metadata; no new Scripture added.
(function(root){
'use strict';
const passage=Object.freeze({
 ref:'JOHN 15:12', translation:'BSB', text:'This is My commandment, that you love one another as I have loved you.',
 segments:Object.freeze(['This is My commandment','that you love one another','as I have loved you']),
 anchors:Object.freeze(['commandment','love one another','loved you']),
 answers:Object.freeze(['commandment','one another','loved']),
 traceParts:Object.freeze(['This is My ', ', that you ', ' as I have ', '.']),
 echoParts:Object.freeze(['This is My ', ', that you love ', ' as I have ', ' you.']),
 linkOrder:Object.freeze([2,0,1]),
 echoBank:Object.freeze(['one another','loved','commandment','know','listen']),
 discovery:Object.freeze({relatedRef:'MARK 12:31',sourceSummary:'Jesus commands his followers to love one another as he has loved them.',relatedSummary:"Jesus identifies love for one's neighbor as one of the greatest commandments.",theme:'LOVE IN ACTION',title:'A command that moves toward people.',note:"Both passages place love at the center of how people treat one another. John 15:12 focuses on Jesus' love as the pattern; Mark 12:31 names love for one's neighbor as a central command.",reviewStatus:'illustrative; editorial review required'})
});
root.VerseCircuitContent=Object.freeze({passage});
})(globalThis);
