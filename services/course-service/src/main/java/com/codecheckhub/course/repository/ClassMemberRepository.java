package com.codecheckhub.course.repository;

import com.codecheckhub.course.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Optional;
import java.util.List;

@Repository
public interface ClassMemberRepository extends JpaRepository<ClassMember, UUID> {
    Optional<ClassMember> findByClassIdAndStudentId(UUID classId, UUID studentId);
    List<ClassMember> findByClassId(UUID classId);
    List<ClassMember> findByStudentId(UUID studentId);
}
