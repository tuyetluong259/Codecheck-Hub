package com.codecheckhub.submission.service;

import com.codecheckhub.submission.entity.Submission;
import com.codecheckhub.submission.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlagiarismService {

    private final SubmissionRepository submissionRepository;

    private static final int K_GRAM_SIZE = 15;
    private static final int WINDOW_SIZE = 4;
    private static final int BASE = 31;
    private static final int MOD = 1000000007;

    @Transactional
    public void checkPlagiarism(Submission newSubmission) {
        log.info("Running Plagiarism Checker (Winnowing) for Submission ID: {}", newSubmission.getId());
        
        List<Submission> previousSubmissions = submissionRepository.findByProblemIdAndStudentIdNot(
                newSubmission.getProblemId(), newSubmission.getStudentId());

        if (previousSubmissions.isEmpty()) {
            newSubmission.setPlagiarismScore(0.0);
            return;
        }

        Set<Integer> newFingerprints = getFingerprints(newSubmission.getSourceCode());
        if (newFingerprints.isEmpty()) {
            newSubmission.setPlagiarismScore(0.0);
            return;
        }

        double maxScore = 0.0;
        UUID matchedId = null;

        for (Submission prev : previousSubmissions) {
            Set<Integer> prevFingerprints = getFingerprints(prev.getSourceCode());
            if (prevFingerprints.isEmpty()) continue;

            // Tính toán mức độ trùng lặp theo thuật toán Jaccard Similarity / Dice Coefficient
            Set<Integer> intersection = new HashSet<>(newFingerprints);
            intersection.retainAll(prevFingerprints);

            double score = (double) intersection.size() / 
                           Math.min(newFingerprints.size(), prevFingerprints.size()) * 100.0;

            if (score > maxScore) {
                maxScore = score;
                matchedId = prev.getId();
            }
        }

        newSubmission.setPlagiarismScore(Math.round(maxScore * 100.0) / 100.0);
        newSubmission.setPlagiarismMatchedSubmissionId(maxScore > 0 ? matchedId : null);
        
        log.info("Plagiarism check complete for {}: {}% matched with {}", 
                newSubmission.getId(), newSubmission.getPlagiarismScore(), matchedId);
    }

    private Set<Integer> getFingerprints(String code) {
        String cleanCode = preprocess(code);
        if (cleanCode.length() < K_GRAM_SIZE) return Collections.emptySet();

        List<Integer> hashes = new ArrayList<>();
        // Tính mã hash cho tất cả k-grams (Rolling Hash)
        long currentHash = 0;
        long highestPower = 1;
        
        for (int i = 0; i < K_GRAM_SIZE - 1; i++) {
            highestPower = (highestPower * BASE) % MOD;
        }

        for (int i = 0; i < cleanCode.length(); i++) {
            currentHash = (currentHash * BASE + cleanCode.charAt(i)) % MOD;
            if (i >= K_GRAM_SIZE) {
                currentHash = (currentHash - (cleanCode.charAt(i - K_GRAM_SIZE) * highestPower) % MOD + MOD) % MOD;
            }
            if (i >= K_GRAM_SIZE - 1) {
                hashes.add((int) currentHash);
            }
        }

        // Thuật toán Winnowing: Chọn mã băm nhỏ nhất trong mỗi cửa sổ (Window)
        Set<Integer> fingerprints = new HashSet<>();
        for (int i = 0; i <= hashes.size() - WINDOW_SIZE; i++) {
            int minHash = Integer.MAX_VALUE;
            for (int j = 0; j < WINDOW_SIZE; j++) {
                if (hashes.get(i + j) < minHash) {
                    minHash = hashes.get(i + j);
                }
            }
            fingerprints.add(minHash);
        }

        return fingerprints;
    }

    private String preprocess(String code) {
        if (code == null) return "";
        // Loại bỏ khoảng trắng, ký tự xuống dòng và các chú thích (comments)
        // Đây là bước quan trọng giúp chống lại việc sinh viên đổi formating code
        return code.replaceAll("\\s+", "")
                   .replaceAll("//.*", "")
                   .replaceAll("/\\*.*?\\*/", "")
                   .toLowerCase();
    }
}
