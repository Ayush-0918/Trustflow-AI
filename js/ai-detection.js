window.TrustFlowAIDetection = {

    getScenario(type) {

        if (type === "suspicious") {

            let voiceStress = Math.floor(Math.random() * 30) + 60
            let facialConsistency = Math.floor(Math.random() * 40) + 40
            let confidenceLevel = Math.floor(Math.random() * 40) + 30
            let commitmentSignal = Math.floor(Math.random() * 40) + 30

            let riskScore = (
                voiceStress +
                (100 - facialConsistency) +
                (100 - confidenceLevel) +
                (100 - commitmentSignal)
            ) / 4

            return {

                participant: "Karan Mehta",
                project: "E-commerce Platform Milestone Call",

                riskClass: "danger",
                riskLabel: "High Risk",
                riskSummary: "AI detected hesitation, stress spikes and weak commitment signals.",

                voiceStress: voiceStress,
                facialConsistency: facialConsistency,
                confidenceLevel: confidenceLevel,
                commitmentSignal: commitmentSignal,

                voiceStressTone: "danger",
                facialTone: "warning",
                confidenceTone: "danger",
                commitmentTone: "danger",

                callState: "Trust Warning",
                callStage: "Analyzing live behavioral signals",

                warningTitle: "AI detected behavioral inconsistencies",
                warningMessage: "TrustFlow recommends pausing escrow release until the freelancer reconfirms milestone commitment.",

                patternScore: riskScore.toFixed(0),
                patternSummary: "Multiple behavioral anomalies detected during conversation.",

                escrowAction: "Hold Escrow",
                escrowSummary: "Payment locked until trust verification improves.",

                highlights: [
                    {
                        title: "Voice stress spike",
                        body: "Elevated stress detected when discussing deadlines."
                    },
                    {
                        title: "Low confidence",
                        body: "Freelancer hesitated when confirming delivery timeline."
                    },
                    {
                        title: "Facial inconsistency",
                        body: "Facial expressions mismatched verbal confidence."
                    }
                ]

            }

        }


        if (type === "healthy") {

            let voiceStress = Math.floor(Math.random() * 20) + 10
            let facialConsistency = Math.floor(Math.random() * 20) + 80
            let confidenceLevel = Math.floor(Math.random() * 15) + 85
            let commitmentSignal = Math.floor(Math.random() * 10) + 90

            let trustScore = (
                (100 - voiceStress) +
                facialConsistency +
                confidenceLevel +
                commitmentSignal
            ) / 4

            return {

                participant: "Riya Sharma",
                project: "UI Dashboard Milestone Review",

                riskClass: "success",
                riskLabel: "Low Risk",
                riskSummary: "AI detected stable behavior, confident delivery commitment.",

                voiceStress: voiceStress,
                facialConsistency: facialConsistency,
                confidenceLevel: confidenceLevel,
                commitmentSignal: commitmentSignal,

                voiceStressTone: "safe",
                facialTone: "safe",
                confidenceTone: "safe",
                commitmentTone: "safe",

                callState: "Trust Stable",
                callStage: "Behavior signals normal",

                warningTitle: "AI trust verification passed",
                warningMessage: "Freelancer demonstrated stable confidence and commitment signals.",

                patternScore: trustScore.toFixed(0),
                patternSummary: "Behavioral signals indicate reliable milestone delivery.",

                escrowAction: "Release Escrow",
                escrowSummary: "Milestone payment can proceed.",

                highlights: [
                    {
                        title: "Stable voice pattern",
                        body: "Low stress detected during conversation."
                    },
                    {
                        title: "Strong commitment signal",
                        body: "Freelancer confidently confirmed milestone delivery."
                    },
                    {
                        title: "Consistent facial cues",
                        body: "Expressions matched verbal statements."
                    }
                ]

            }

        }

    }
    
}
