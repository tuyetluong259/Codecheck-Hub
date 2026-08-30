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

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT c.studentId) FROM ClassMember c WHERE c.classId IN :classIds")
    long countDistinctStudentIdByClassIdIn(@org.springframework.data.repository.query.Param("classIds") List<UUID> classIds);
}
